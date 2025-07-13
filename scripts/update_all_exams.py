#!/usr/bin/env python3
"""
Automated script to update ExamTopics exam data.
Simplified version for integration into the main branch.
"""

import os
import sys
import json
import time
import argparse
from datetime import datetime

# Add the scripts directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from scraper import update_exam_data

class ProgressTracker:
    """Simple progress tracker for automation"""
    def __init__(self, description=""):
        self.description = description
        
    def progress(self, value, text=""):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {text}")

def get_available_exam_codes():
    """Get all exam codes from existing exam directories"""
    exam_codes = set()
    # Update path to go up one level to find data directory
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    
    if not os.path.exists(data_dir):
        print(f"❌ Data directory '{data_dir}' not found")
        return exam_codes
    
    # Look for exam directories containing exam.json
    for item in os.listdir(data_dir):
        item_path = os.path.join(data_dir, item)
        if os.path.isdir(item_path):
            exam_json = os.path.join(item_path, 'exam.json')
            if os.path.exists(exam_json):
                exam_codes.add(item)
    
    print(f"📋 Found {len(exam_codes)} exams: {sorted(exam_codes)}")
    return sorted(exam_codes)

def update_single_exam(exam_code, progress_tracker, force_rescan=False, force_update=False):
    """Update a single exam and return results"""
    print(f"\n🔄 Updating exam: {exam_code}")
    if force_rescan:
        print(f"🔄 Force rescanning links for {exam_code}")
    if force_update:
        print(f"🔄 Force updating existing questions for {exam_code}")
    
    try:
        # Use respectful scraping mode (with delays) for better compliance
        # update_exam_data returns a tuple (questions, message, success)
        questions, message, success = update_exam_data(exam_code, progress_tracker, rapid_scraping=False, force_rescan=force_rescan, force_update=force_update)
        
        if not success:
            print(f"❌ {exam_code}: Update failed - {message}")
            return {
                'exam_code': exam_code,
                'status': 'failed',
                'question_count': len(questions) if questions else 0,
                'error': message
            }
        else:
            question_count = len(questions) if questions else 0
            success_message = f"{question_count} questions updated successfully"
            if message:  # Add chunk information if available
                success_message += f". {message}"
            print(f"✅ {exam_code}: {success_message}")
            return {
                'exam_code': exam_code,
                'status': 'success',
                'question_count': question_count,
                'error': None
            }
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ {exam_code}: Exception occurred - {error_msg}")
        return {
            'exam_code': exam_code,
            'status': 'failed',
            'question_count': 0,
            'error': error_msg
        }

def main():
    """Main automation function"""
    parser = argparse.ArgumentParser(description='Update ExamTopics exam data')
    parser.add_argument('--force-rescan', action='store_true', 
                        help='Force rescan of links even if they are marked as complete')
    parser.add_argument('--force-update', action='store_true', 
                        help='Force update of existing questions even if they seem unchanged')
    parser.add_argument('--exam', type=str, 
                        help='Update only a specific exam code')
    
    args = parser.parse_args()
    
    print("🚀 Starting automated exam data update")
    print(f"⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    
    if args.force_rescan:
        print("🔄 Force rescan mode enabled - will rescan all links")
    if args.force_update:
        print("🔄 Force update mode enabled - will update existing questions")
    
    # Get available exam codes
    exam_codes = get_available_exam_codes()
    
    if not exam_codes:
        print("❌ No exam codes found. Exiting.")
        sys.exit(1)
    
    # Filter to specific exam if requested
    if args.exam:
        if args.exam in exam_codes:
            exam_codes = [args.exam]
            print(f"📋 Updating only exam: {args.exam}")
        else:
            print(f"❌ Exam code '{args.exam}' not found. Available exams: {sorted(exam_codes)}")
            sys.exit(1)
    
    # Initialize tracking variables
    results = []
    successful_updates = 0
    failed_updates = 0
    total_questions = 0
    
    # Create progress tracker
    progress_tracker = ProgressTracker("Automated Update")
    
    # Update each exam
    for i, exam_code in enumerate(exam_codes, 1):
        print(f"\n📊 Progress: {i}/{len(exam_codes)} exams")
        
        # Update the exam
        result = update_single_exam(exam_code, progress_tracker, force_rescan=args.force_rescan, force_update=args.force_update)
        results.append(result)
        
        # Update counters
        if result['status'] == 'success':
            successful_updates += 1
            total_questions += result['question_count']
        else:
            failed_updates += 1
        
        # Add delay between exams to be respectful
        if i < len(exam_codes):  # Don't wait after the last exam
            print(f"⏳ Waiting 15 seconds before next exam...")
            time.sleep(15)
    
    # Generate summary
    print(f"\n📈 Update Summary:")
    print(f"   📋 Total exams processed: {len(exam_codes)}")
    print(f"   ✅ Successful updates: {successful_updates}")
    print(f"   ❌ Failed updates: {failed_updates}")
    print(f"   📊 Total questions: {total_questions}")
    if args.force_rescan:
        print(f"   🔄 Force rescan was enabled")
    
    # Save detailed log
    log_data = {
        'timestamp': datetime.now().isoformat(),
        'force_rescan': args.force_rescan,
        'force_update': args.force_update,
        'specific_exam': args.exam,
        'total_exams': len(exam_codes),
        'successful_updates': successful_updates,
        'failed_updates': failed_updates,
        'total_questions': total_questions,
        'results': results
    }
    
    # Save log in the root directory
    log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'update_log.json')
    with open(log_path, 'w') as f:
        json.dump(log_data, f, indent=2)
    
    print(f"📝 Detailed log saved to update_log.json")
    
    # Exit with appropriate code
    if failed_updates > 0:
        print(f"⚠️  Completed with {failed_updates} failures")
        sys.exit(1)
    else:
        print(f"🎉 All updates completed successfully!")
        sys.exit(0)

if __name__ == "__main__":
    main() 