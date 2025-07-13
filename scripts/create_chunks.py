#!/usr/bin/env python3
"""
Script to create chunked versions of large exam files for lazy loading
"""

import json
import os
import math
import argparse

def load_json(file_path):
    """Load JSON file safely"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading {file_path}: {e}")
        return None

def save_json(data, file_path):
    """Save JSON file safely"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving {file_path}: {e}")
        return False

def create_chunks_for_exam(exam_code, chunk_size=50, force=False):
    """
    Create chunked version of an exam file
    
    Args:
        exam_code (str): Exam code (e.g., 'CAD')
        chunk_size (int): Number of questions per chunk
        force (bool): Overwrite existing chunks
    """
    # File paths
    source_file = f"data/{exam_code}/exam.json"
    metadata_file = f"data/{exam_code}/metadata.json"
    chunks_dir = f"data/{exam_code}/chunks"
    
    # Check if source file exists
    if not os.path.exists(source_file):
        print(f"Source file {source_file} not found")
        return False
    
    # Load exam data
    exam_data = load_json(source_file)
    if not exam_data or 'questions' not in exam_data:
        print(f"Invalid exam data in {source_file}")
        return False
    
    questions = exam_data['questions']
    total_questions = len(questions)
    
    # Check if chunking is needed
    if total_questions <= chunk_size:
        print(f"Exam {exam_code} has only {total_questions} questions, chunking not needed")
        return False
    
    # Calculate number of chunks
    total_chunks = math.ceil(total_questions / chunk_size)
    
    print(f"Creating {total_chunks} chunks for {exam_code} ({total_questions} questions, {chunk_size} per chunk)")
    
    # Create chunks directory
    os.makedirs(chunks_dir, exist_ok=True)
    
    # Check if chunks already exist
    if not force:
        existing_chunks = []
        for chunk_id in range(total_chunks):
            chunk_file = f"{chunks_dir}/chunk_{chunk_id}.json"
            if os.path.exists(chunk_file):
                existing_chunks.append(chunk_id)
        
        if existing_chunks:
            print(f"Found existing chunks: {existing_chunks}")
            response = input("Overwrite existing chunks? (y/N): ")
            if response.lower() != 'y':
                print("Skipping chunk creation")
                return False
    
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
        if save_json(chunk_data, chunk_file):
            created_chunks.append(chunk_id)
            print(f"  ✓ Created chunk {chunk_id}: questions {start_idx + 1}-{end_idx}")
        else:
            print(f"  ✗ Failed to create chunk {chunk_id}")
    
    # Create metadata file
    metadata = {
        "exam_code": exam_code,
        "exam_name": exam_data.get('exam_name', exam_code),
        "chunked": True,
        "chunk_size": chunk_size,
        "total_chunks": total_chunks,
        "total_questions": total_questions,
        "created_chunks": created_chunks,
        "created_at": "2025-07-13"
    }
    
    if save_json(metadata, metadata_file):
        print(f"  ✓ Created metadata file: {metadata_file}")
    else:
        print(f"  ✗ Failed to create metadata file")
        return False
    
    print(f"Successfully created {len(created_chunks)} chunks for {exam_code}")
    return True

def process_all_exams(chunk_size=50, min_questions=100, force=False):
    """
    Process all exams in the data directory and create chunks for large ones
    
    Args:
        chunk_size (int): Number of questions per chunk
        min_questions (int): Minimum questions to consider for chunking
        force (bool): Overwrite existing chunks
    """
    data_dir = "data"
    if not os.path.exists(data_dir):
        print(f"Data directory {data_dir} not found")
        return
    
    # Find all exam directories
    exam_dirs = []
    for item in os.listdir(data_dir):
        item_path = os.path.join(data_dir, item)
        if os.path.isdir(item_path) and os.path.exists(os.path.join(item_path, 'exam.json')):
            exam_dirs.append(item)
    
    print(f"Found {len(exam_dirs)} exam directories")
    
    processed = 0
    for exam_code in sorted(exam_dirs):
        # Load exam to check size
        exam_file = os.path.join(data_dir, exam_code, 'exam.json')
        exam_data = load_json(exam_file)
        if not exam_data or 'questions' not in exam_data:
            continue
        
        question_count = len(exam_data['questions'])
        print(f"\n{exam_code}: {question_count} questions")
        
        if question_count >= min_questions:
            if create_chunks_for_exam(exam_code, chunk_size, force):
                processed += 1
        else:
            print(f"  Skipping (too few questions)")
    
    print(f"\nProcessed {processed} exams")

def cleanup_chunks(exam_code):
    """Remove all chunk files for an exam"""
    chunks_dir = f"data/{exam_code}/chunks"
    metadata_file = f"data/{exam_code}/metadata.json"
    
    removed = 0
    
    # Remove chunks directory
    if os.path.exists(chunks_dir):
        try:
            import shutil
            shutil.rmtree(chunks_dir)
            print(f"Removed chunks directory: {chunks_dir}")
            removed += 1
        except Exception as e:
            print(f"Error removing chunks directory: {e}")
    
    # Remove metadata file
    if os.path.exists(metadata_file):
        try:
            os.remove(metadata_file)
            print(f"Removed {metadata_file}")
            removed += 1
        except Exception as e:
            print(f"Error removing metadata file: {e}")
    
    print(f"Removed {removed} items")

def main():
    parser = argparse.ArgumentParser(description='Create chunked versions of exam files for lazy loading')
    parser.add_argument('--exam', help='Process specific exam code (e.g., CAD)')
    parser.add_argument('--all', action='store_true', help='Process all exams')
    parser.add_argument('--cleanup', help='Remove chunks for specific exam code')
    parser.add_argument('--chunk-size', type=int, default=50, help='Questions per chunk (default: 50)')
    parser.add_argument('--min-questions', type=int, default=100, help='Minimum questions to chunk (default: 100)')
    parser.add_argument('--force', action='store_true', help='Overwrite existing chunks')
    
    args = parser.parse_args()
    
    if args.cleanup:
        cleanup_chunks(args.cleanup)
    elif args.exam:
        create_chunks_for_exam(args.exam, args.chunk_size, args.force)
    elif args.all:
        process_all_exams(args.chunk_size, args.min_questions, args.force)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()