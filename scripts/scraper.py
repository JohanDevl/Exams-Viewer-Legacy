from bs4 import BeautifulSoup
import requests
import re
import json
import time
import os
import hashlib
import random
import urllib.robotparser
import base64
from urllib.parse import urljoin, urlparse
from PIL import Image
import io

# Streamlit removed - not needed for automation scripts

# IMPROVEMENTS: Enhanced scraper with smart update logic
# 
# 1. ENHANCED MOST_VOTED EXTRACTION (3-tier approach):
#    - Primary: Look for answers with "is_most_voted": true (ExamTopics official majority)
#    - Secondary: If none found, take the answer with the highest vote count (if > 0)
#    - Tertiary: If no votes, extract suggested answer from "correct-answer" class
#    This ensures we capture all types of answers: voted, partially voted, and suggested.
#
# 2. SMART UPDATE DETECTION:
#    - Compare existing vs new question data before updating
#    - Only update questions when content actually changed
#    - Detect changes in: most_voted, question content, answers, content hash
#    - Support force_update mode for complete refresh
#    This ensures existing questions benefit from scraper improvements automatically.

HEADERS = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Referer": "https://google.com",
            "Connection": "keep-alive",
        }
PREFIX = "https://www.examtopics.com/discussions/"

def respectful_request(url, headers=None, timeout=30):
    """
    Make a respectful HTTP request with built-in delays and error handling
    """
    if headers is None:
        headers = HEADERS
    
    try:
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed for {url}: {e}")
        return None

def check_robots_txt(base_url):
    """
    Check if robots.txt allows scraping of the given URL
    """
    try:
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(f"{base_url}/robots.txt")
        rp.read()
        user_agent = HEADERS.get("User-Agent", "*")
        return rp.can_fetch(user_agent, base_url)
    except Exception:
        # If robots.txt check fails, assume it's allowed but be cautious
        return True

def load_json(json_path):
    if not os.path.exists(json_path):
        return {}
    with open(json_path, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}
        
def save_json(file, json_path):
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(file, f, ensure_ascii=False, indent=2)

def get_exam_category(exam_code):
    response = requests.get(f"https://www.examtopics.com/search/?query={exam_code}", allow_redirects=True)
    final_url = response.url
    if "/exams/" in final_url:
        parts = final_url.strip("/").split("/")
        if len(parts) >= 2:
            return parts[-2]  # category is second-to-last
        return None

    soup = BeautifulSoup(response.content, "html.parser")
    exam_list = soup.find_all("ul", class_="exam-list-font")
    if len(exam_list) < 1:
        return None

    for exam in exam_list:
        for a in exam.find_all("a", href=True):
            if a.text.strip().startswith(exam_code):
                href = a['href']
                # Split the path and get the second-to-last segment
                parts = href.strip("/").split("/")
                if len(parts) >= 2:
                    return parts[-2]
    
    return None

def get_question_links(exam_code, progress, json_path, force_rescan=False):
    progress.progress(0, text=f"Starting link extraction...")
    category = get_exam_category(exam_code)

    if not category:
        raise ValueError(f"Exam code {exam_code} not found.")

    url = f"{PREFIX}{category}/"
    # Check robots.txt before proceeding
    if not check_robots_txt(url):
        raise ValueError(f"Robots.txt disallows scraping of {url}")
    
    # Get the first page to find number of pages
    response = respectful_request(url)
    if not response:
        raise ValueError("Failed to access the website")
    soup = BeautifulSoup(response.content, "html.parser")

    # Find number of pages
    page_indicator = soup.find("span", class_="discussion-list-page-indicator")
    if not page_indicator:
        raise ValueError("Page indicator not found. Page structure may have changed.")
    strong_tags = page_indicator.find_all("strong")
    num_pages = int(strong_tags[1].text)

    links_json = load_json(json_path)
    if links_json and not force_rescan:
        question_links = links_json.get("links", [])
        page_num = links_json.get("page_num", 1)
        status = links_json.get("status", "in progress")
        if status == "complete":
            progress.progress(1, text=f"Links extracted from file")
            return question_links
    else:
        question_links = []
        page_num = 1
        status = "in progress"

    # If force_rescan is True, start fresh
    if force_rescan:
        question_links = []
        page_num = 1
        status = "in progress"
        progress.progress(0, text=f"Force rescanning links...")

    # Loop through all pages
    for i in range(page_num, num_pages + 1):
        progress.progress((i) / num_pages, text=f"Extracting question links - page {i} of {num_pages}...")
        page_url = url + f"{i}/"

        page_response = respectful_request(page_url)
        if not page_response:
            continue  # Skip this page if request fails
        soup = BeautifulSoup(page_response.content, "html.parser")
        titles = soup.find_all("div", class_="dicussion-title-container")
        for title in titles:
            if title.text:
                title_text = title.text.strip()
                if f"Exam {exam_code}" in title_text:
                    a_tag = title.find("a")
                    if a_tag and "href" in a_tag.attrs:
                        question_links.append(a_tag["href"])
        
        # Add delay between pages (except for the last page)
        if i < num_pages:
            delay = random.uniform(2, 5)  # Shorter delay for page navigation
            time.sleep(delay)
    sorted_links = sorted(question_links, key=lambda link: int(re.search(r'question-(\d+)', link).group(1)))
    question_links_obj = {"page_num": i, "status": "complete", "links": sorted_links}
    save_json(question_links_obj, json_path)
    return sorted_links

def scrape_page(link):
    question_object = {}

    try:
        response = respectful_request(link)
        if not response:
            raise Exception("Failed to get response")
        soup = BeautifulSoup(response.content, "html.parser")
    except Exception as e:
        return {
            "question": "",
            "answers": [],
            "comments": [],
            "most_voted": None,
            "link": link,
            "question_number": "unknown",
            "images": {},
            "error": f"Request or parsing failed: {e}"
        }

    question_number_match = re.search(r"question-(\d+)", link)
    question_number = question_number_match.group(1) if question_number_match else "unknown"
    
    # Extract and process images from the question
    base_url = "https://www.examtopics.com"
    images = extract_and_process_images(soup, base_url)

    # Extract question
    question = ""
    try:
        question_div = soup.find("div", class_="question-body")
        question_content = question_div.find("p", class_="card-text") if question_div else None
        if question_content:
            question = question_content.decode_contents().strip()
    except Exception:
        pass

    # Extract most voted answers (improved logic)
    most_voted = None
    try:
        voted_answers = soup.find("div", class_="voted-answers-tally")
        if voted_answers:
            script_content = voted_answers.find("script")
            if script_content and script_content.string:
                voted_json = json.loads(script_content.string)
                
                # First try: Look for officially marked most_voted (original logic)
                most_voted_object = next((item for item in voted_json if item.get('is_most_voted')), None)
                if most_voted_object:
                    most_voted = most_voted_object.get("voted_answers", None)
                else:
                    # Improved logic: Take the answer with the most votes (if > 0)
                    if voted_json:
                        # Sort by vote_count in descending order
                        sorted_votes = sorted(voted_json, key=lambda x: x.get('vote_count', 0), reverse=True)
                        top_answer = sorted_votes[0]
                        
                        # Only if it has at least 1 vote
                        if top_answer.get('vote_count', 0) > 0:
                            most_voted = top_answer.get("voted_answers", None)
    except Exception:
        pass
    
    # Third tier: Extract suggested answer if no votes found
    if most_voted is None:
        try:
            suggested_answer = soup.find("span", class_="correct-answer")
            if suggested_answer:
                most_voted = suggested_answer.text.strip()
        except Exception:
            pass

    # Extract answer options
    answers = []
    try:
        if question_div:
            answers_div = question_div.find("div", class_="question-choices-container")
            if answers_div:
                answer_options = answers_div.find_all("li")
                if answer_options:
                    answers = [re.sub(r'\s+', ' ', answer_option.text).strip() for answer_option in answer_options]
    except Exception:
        pass

    # Extract comments and replies
    comments = []
    try:
        discussion_div = soup.find("div", class_="discussion-container")
        comment_divs = discussion_div.find_all("div", class_="comment-container", recursive=False) if discussion_div else []
        for comment_div in comment_divs:
            comment = {}
            try:
                comment_content_div = comment_div.find("div", class_="comment-content")
                comment_content = comment_content_div.text.strip() if comment_content_div else ""
            except Exception:
                comment_content = ""

            try:
                comment_selected_answer = comment_div.find("div", class_="comment-selected-answers")
                selected_answer = comment_selected_answer.find("span").text.strip() if comment_selected_answer else ""
            except Exception:
                selected_answer = ""

            replies = []
            try:
                comment_replies_div = comment_div.find("div", class_="comment-replies")
                if comment_replies_div:
                    reply_divs = comment_replies_div.find_all("div", class_="comment-container")
                    for reply in reply_divs:
                        try:
                            reply_content = reply.find("div", class_="comment-content").text.strip()
                        except Exception:
                            reply_content = ""
                        replies.append(reply_content)
            except Exception:
                pass

            comment["content"] = comment_content
            comment["selected_answer"] = selected_answer
            comment["replies"] = replies

            comments.append(comment)
    except Exception:
        pass

    question_object["question"] = question
    question_object["answers"] = answers
    question_object["comments"] = comments
    question_object["question_number"] = question_number
    question_object["link"] = link
    question_object["most_voted"] = most_voted
    question_object["images"] = images
    question_object["error"] = None

    return question_object


def calculate_question_hash(question_data):
    """
    Calculate hash to detect changes in a question
    Includes: question, answers, most_voted
    Excludes: comments (too volatile), link, error
    """
    relevant_data = {
        'question': question_data.get('question', ''),
        'answers': question_data.get('answers', []),
        'most_voted': question_data.get('most_voted', None)
    }
    
    # Convert to normalized JSON string for hashing
    json_str = json.dumps(relevant_data, sort_keys=True, ensure_ascii=False)
    return hashlib.md5(json_str.encode('utf-8')).hexdigest()


def needs_update(existing_question, new_question):
    """
    Determine if a question needs to be updated
    """
    # Case 1: most_voted null in existing but not in new
    if existing_question.get('most_voted') is None and new_question.get('most_voted') is not None:
        return True, "most_voted was null, now has value"
    
    # Case 2: most_voted different
    if existing_question.get('most_voted') != new_question.get('most_voted'):
        return True, f"most_voted changed: {existing_question.get('most_voted')} -> {new_question.get('most_voted')}"
    
    # Case 3: question content different
    if existing_question.get('question') != new_question.get('question'):
        return True, "question content changed"
    
    # Case 4: answers different
    if existing_question.get('answers') != new_question.get('answers'):
        return True, "answers changed"
    
    # Case 5: hash different (general detection)
    existing_hash = calculate_question_hash(existing_question)
    new_hash = calculate_question_hash(new_question)
    if existing_hash != new_hash:
        return True, f"content hash changed: {existing_hash[:8]} -> {new_hash[:8]}"
    
    return False, "no changes detected"

        
def scrape_questions(question_links, json_path, progress, rapid_scraping=False, force_update=False):
    questions_obj = load_json(json_path)
    if questions_obj:
        questions = questions_obj.get("questions", [])
    else:
        questions = []
    
    # Create dictionary for quick access by question number
    existing_questions_dict = {q["question_number"]: q for q in questions}
    
    prefix = "https://www.examtopics.com"
    questions_num = len(question_links)
    error_string = ""
    
    updated_count = 0
    new_count = 0
    skipped_count = 0
    
    for i, link in enumerate(question_links):
        question_number_match = re.search(r"question-(\d+)", link)
        question_number = question_number_match.group(1) if question_number_match else "unknown"
        
        # Check if question already exists
        existing_question = existing_questions_dict.get(question_number)
        
        if existing_question and not force_update:
            # Scrape new version for comparison
            progress.progress((i+1)/(questions_num), text=f"{i+1}/{questions_num} - Checking {prefix+link}")
            new_question = scrape_page(prefix+link)
            
            if new_question["error"]:
                error_string = f"Error: {new_question['error']}"
                break
            
            # Check if update is needed
            update_needed, reason = needs_update(existing_question, new_question)
            
            if update_needed:
                # Update existing question
                for j, q in enumerate(questions):
                    if q["question_number"] == question_number:
                        questions[j] = new_question
                        updated_count += 1
                        progress.progress((i+1)/(questions_num), text=f"{i+1}/{questions_num} - Updated {prefix+link} ({reason})")
                        break
            else:
                skipped_count += 1
                progress.progress((i+1)/(questions_num), text=f"{i+1}/{questions_num} - Skipped {prefix+link} (no changes)")
        else:
            # New question or force_update enabled
            progress.progress((i+1)/(questions_num), text=f"{i+1}/{questions_num} - Scraping {prefix+link}")
            question_object = scrape_page(prefix+link)
            
            if question_object["error"]:
                error_string = f"Error: {question_object['error']}"
                break
            
            if existing_question:
                # Replace existing question (force_update)
                for j, q in enumerate(questions):
                    if q["question_number"] == question_number:
                        questions[j] = question_object
                        updated_count += 1
                        break
            else:
                # Add new question
                questions.append(question_object)
                new_count += 1
        
        if not rapid_scraping:
            # Random delay between 5-10 seconds to be more respectful and less predictable
            delay = random.uniform(5, 10)
            time.sleep(delay)
    
    questions.sort(key=lambda x: int(x["question_number"]) if x["question_number"].isdigit() else float('inf'))
    status = "complete" if len(questions) == questions_num else "in progress"
    questions_obj = {"status": status, "error": error_string, "questions": questions}
    save_json(questions_obj, json_path)
    
    # Print summary if there were updates
    if updated_count > 0 or new_count > 0:
        print(f"\n📊 Update Summary:")
        print(f"   ✅ New questions added: {new_count}")
        print(f"   🔄 Existing questions updated: {updated_count}")
        print(f"   ⏭️  Questions skipped (no changes): {skipped_count}")
    
    return questions_obj
    

def load_json_from_github(exam_code):
    url = f"https://raw.githubusercontent.com/17Andri17/ExamTopics-Question-Viewer/refs/heads/main/data/{exam_code}.json"
    try:
        response = requests.get(url)
        response.raise_for_status()
        questions_obj = json.loads(response.text)
        questions = questions_obj.get("questions", [])
        return questions, ""
    except requests.RequestException as e:
        return [], f"Failed to load file from GitHub for exam {exam_code}. It probably does not exist."


def get_current_links_count(exam_code, timeout=10):
    """
    Gets the current number of available links without modifying files
    Uses a quick estimation method to avoid long delays
    """
    try:
        category = get_exam_category(exam_code)
        if not category:
            return 0
        
        url = f"{PREFIX}{category}/"
        response = requests.get(url, headers=HEADERS, timeout=timeout)
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Find number of pages
        page_indicator = soup.find("span", class_="discussion-list-page-indicator")
        if not page_indicator:
            return 0
        
        strong_tags = page_indicator.find_all("strong")
        if len(strong_tags) < 2:
            return 0
        
        num_pages = int(strong_tags[1].text)
        
        # Quick estimation: only check first few pages to estimate total
        # This is much faster than checking all pages
        sample_pages = min(3, num_pages)  # Check max 3 pages for estimation
        total_links = 0
        
        for i in range(1, sample_pages + 1):
            page_url = url + f"{i}/"
            page_response = requests.get(page_url, headers=HEADERS, timeout=timeout)
            soup = BeautifulSoup(page_response.content, "html.parser")
            titles = soup.find_all("div", class_="dicussion-title-container")
            
            page_links = 0
            for title in titles:
                if title.text and f"Exam {exam_code}" in title.text.strip():
                    page_links += 1
            total_links += page_links
        
        # Estimate total based on sample
        if sample_pages < num_pages:
            avg_per_page = total_links / sample_pages if sample_pages > 0 else 0
            estimated_total = int(avg_per_page * num_pages)
            return estimated_total
        
        return total_links
    except Exception:
        return 0


def check_for_updates(exam_code, progress, skip_online_check=False):
    """
    Checks if exam files need to be updated by comparing 
    existing links with newly available links
    """
    exam_dir = f"data/{exam_code}"
    questions_path = f"{exam_dir}/exam.json"
    links_path = f"{exam_dir}/links.json"
    
    # Check if files exist
    questions_exist = os.path.exists(questions_path)
    links_exist = os.path.exists(links_path)
    
    # If no files exist, update needed
    if not questions_exist and not links_exist:
        return True, "Exam files not found"
    
    # If questions file doesn't exist but links exist
    if not questions_exist:
        return True, "Questions file missing"
    
    # Load existing questions
    questions_json = load_json(questions_path)
    if not questions_json:
        return True, "Questions file corrupted or empty"
    
    # Check if status is "complete"
    if questions_json.get("status") != "complete":
        return True, "Previous scraping incomplete"
    
    # Skip online check if requested (for faster loading)
    if skip_online_check:
        return False, "Files exist and complete (online check skipped)"
    
    # Get current number of available links with timeout
    progress.progress(15, text="Checking for new questions...")
    try:
        current_links_count = get_current_links_count(exam_code, timeout=5)
    except Exception:
        # If network check fails, assume files are up to date
        return False, "Network check failed, assuming files are up to date"
    
    if current_links_count == 0:
        # Unable to check, assume files are up to date
        return False, "Unable to check for updates"
    
    existing_questions = questions_json.get("questions", [])
    existing_count = len(existing_questions)
    
    # If there are more links available than existing questions
    if current_links_count > existing_count:
        return True, f"New questions detected: {current_links_count - existing_count} missing questions"
    
    return False, "Files up to date"


# Image compression and processing functions
def ensure_images_directory():
    """Create images directory if it doesn't exist"""
    os.makedirs("data/images", exist_ok=True)

def download_and_compress_image(img_url, max_size=(800, 600), quality=85):
    """
    Download and compress an image, return the optimized image data
    """
    try:
        response = respectful_request(img_url)
        if not response:
            return None
            
        # Load image
        image = Image.open(io.BytesIO(response.content))
        
        # Convert to RGB if necessary (for PNG with transparency)
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Resize if too large
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save as WebP for better compression
        output = io.BytesIO()
        image.save(output, format='WebP', quality=quality, optimize=True)
        webp_data = output.getvalue()
        
        # Fallback JPEG for compatibility
        output_jpeg = io.BytesIO()
        image.save(output_jpeg, format='JPEG', quality=quality, optimize=True)
        jpeg_data = output_jpeg.getvalue()
        
        return {
            'webp': base64.b64encode(webp_data).decode('utf-8'),
            'jpeg': base64.b64encode(jpeg_data).decode('utf-8'),
            'original_url': img_url,
            'size': image.size
        }
        
    except Exception as e:
        print(f"Error processing image {img_url}: {e}")
        return None

def extract_and_process_images(soup, base_url):
    """
    Extract images from question content only and process them
    """
    images = {}
    
    # Only look for images inside the question content area
    question_div = soup.find("div", class_="question-body")
    if not question_div:
        return images
    
    img_tags = question_div.find_all('img')
    
    for i, img in enumerate(img_tags):
        src = img.get('src')
        if not src:
            continue
            
        # Convert relative URLs to absolute
        if src.startswith('//'):
            src = 'https:' + src
        elif src.startswith('/'):
            src = urljoin(base_url, src)
        elif not src.startswith('http'):
            src = urljoin(base_url, src)
        
        # Enhanced filtering for question images only
        if should_skip_image(src):
            continue
            
        print(f"  📸 Processing question image: {src}")
        
        # Generate unique ID for this image
        img_id = f"img_{hashlib.md5(src.encode()).hexdigest()[:8]}"
        
        # Process and compress image
        try:
            processed_img = download_and_compress_image(src)
            if processed_img:
                images[img_id] = processed_img
                # Replace img tag with reference
                img['data-img-id'] = img_id
                img['src'] = f"data:image/webp;base64,{processed_img['webp'][:50]}..." # Placeholder
                print(f"  ✅ Image compressed: {len(processed_img['webp'])} bytes")
            else:
                print(f"  ❌ Failed to process image: {src}")
        except Exception as e:
            print(f"  ⚠️ Error processing image {src}: {e}")
            continue
        
        # Add small delay between image downloads
        time.sleep(0.5)
    
    return images

def should_skip_image(src):
    """
    Determine if an image should be skipped based on URL patterns
    """
    src_lower = src.lower()
    
    # Skip tracking pixels and social media
    tracking_patterns = [
        'facebook.com/tr',
        'google-analytics.com',
        'googletagmanager.com',
        'doubleclick.net',
        'googlesyndication.com',
        'adsystem.com',
        'linkedin.com/px',
        'twitter.com/i/adsct',
        'pinterest.com/ct',
        'bing.com/tr'
    ]
    
    if any(pattern in src_lower for pattern in tracking_patterns):
        return True
    
    # Skip very small images and UI elements
    ui_patterns = [
        'icon', 'logo', 'avatar', 'button', 'arrow', 'star', 
        'thumb', 'profile', 'social', 'badge', 'sprite'
    ]
    
    # Only skip UI patterns if they're not explicitly question images
    if any(pattern in src_lower for pattern in ui_patterns):
        # Allow if it's clearly an exam/question image
        if not any(exam_pattern in src_lower for exam_pattern in ['examtopics.com', 'question', 'exam', 'image']):
            return True
    
    # Skip images that look like 1x1 tracking pixels
    if any(size in src_lower for size in ['1x1', '1/1', 'pixel']):
        return True
        
    # Skip base64 data URLs (already processed)
    if src.startswith('data:'):
        return True
    
    return False

def create_chunks_for_exam_data(exam_code, questions, chunk_size=50):
    """
    Create chunks directly from questions data after scraping
    Returns the number of chunks created, or False if failed/skipped
    """
    import math
    
    total_questions = len(questions)
    if total_questions <= chunk_size:
        return False  # Not enough questions to chunk
    
    # Calculate number of chunks
    total_chunks = math.ceil(total_questions / chunk_size)
    
    # Create exam directory structure (should already exist from update_exam_data)
    exam_dir = f"data/{exam_code}"
    chunks_dir = f"{exam_dir}/chunks"
    metadata_file = f"{exam_dir}/metadata.json"
    
    os.makedirs(chunks_dir, exist_ok=True)
    
    print(f"Auto-creating {total_chunks} chunks for {exam_code} ({total_questions} questions)")
    
    # Create chunks
    created_chunks = []
    for chunk_id in range(total_chunks):
        start_idx = chunk_id * chunk_size
        end_idx = min(start_idx + chunk_size, total_questions)
        
        chunk_questions = questions[start_idx:end_idx]
        
        chunk_data = {
            "chunk_id": chunk_id,
            "start_question": start_idx + 1,
            "end_question": end_idx,
            "questions_count": len(chunk_questions),
            "questions": chunk_questions
        }
        
        chunk_file = f"{chunks_dir}/chunk_{chunk_id}.json"
        try:
            save_json(chunk_data, chunk_file)
            created_chunks.append(chunk_id)
            print(f"  ✓ Created chunk {chunk_id}: questions {start_idx + 1}-{end_idx}")
        except Exception as e:
            print(f"  ✗ Failed to create chunk {chunk_id}: {e}")
    
    # Create metadata file
    exam_name = exam_code  # Could be enhanced to extract from questions data
    metadata = {
        "exam_code": exam_code,
        "exam_name": exam_name,
        "chunked": True,
        "chunk_size": chunk_size,
        "total_chunks": total_chunks,
        "total_questions": total_questions,
        "created_chunks": created_chunks,
        "created_at": time.strftime("%Y-%m-%d")
    }
    
    try:
        save_json(metadata, metadata_file)
        print(f"  ✓ Created metadata file: {metadata_file}")
        return len(created_chunks)
    except Exception as e:
        print(f"  ✗ Failed to create metadata file: {e}")
        return False

def update_exam_data(exam_code, progress, rapid_scraping=False, force_rescan=False, force_update=False):
    """
    Updates exam data by scraping new questions with automatic chunking
    """
    # Create exam directory structure
    exam_dir = f"data/{exam_code}"
    os.makedirs(exam_dir, exist_ok=True)
    os.makedirs(f"{exam_dir}/chunks", exist_ok=True)
    
    questions_path = f"{exam_dir}/exam.json"
    links_path = f"{exam_dir}/links.json"
    
    try:
        # Get all question links
        links = get_question_links(exam_code, progress, links_path, force_rescan)
        
        if len(links) == 0:
            return [], "No questions found. Please check the exam code and try again.", False
        
        # Scrape questions
        questions_obj = scrape_questions(links, questions_path, progress, rapid_scraping, force_update)
        questions = questions_obj.get("questions", [])
        
        if questions_obj.get("error", "") != "":
            return (questions, f"Error occurred while scraping questions. Your connection may be slow or the website may have limited your rate. You can still see {len(questions)} questions. Try again later by refreshing the page.", False)
        
        # Auto-chunking disabled - lazy loading no longer needed
        chunk_message = ""
        # Note: Chunk creation has been disabled as lazy loading is no longer used
        # If you need to manually create chunks, use: python scripts/create_chunks.py
        
        return (questions, chunk_message, True)
        
    except Exception as e:
        return [], str(e), False