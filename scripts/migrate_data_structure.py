#!/usr/bin/env python3
"""
Migration script to restructure data organization with folders per exam
"""

import os
import json
import shutil
from pathlib import Path

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
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving {file_path}: {e}")
        return False

def discover_exams(data_dir):
    """Discover all exam codes from existing files"""
    exams = set()
    
    for filename in os.listdir(data_dir):
        if filename.endswith('.json') and filename != 'manifest.json':
            # Skip chunk files - they'll be handled as part of the main exam
            if '_chunk_' in filename:
                continue
                
            # Extract exam code
            if filename.endswith('_links.json'):
                exam_code = filename.replace('_links.json', '')
            elif filename.endswith('_metadata.json'):
                exam_code = filename.replace('_metadata.json', '')
            else:
                exam_code = filename.replace('.json', '')
            
            exams.add(exam_code)
    
    return sorted(list(exams))

def migrate_exam_files(exam_code, data_dir, dry_run=False):
    """Migrate all files for a specific exam to the new structure"""
    exam_dir = os.path.join(data_dir, exam_code)
    chunks_dir = os.path.join(exam_dir, 'chunks')
    
    files_moved = []
    
    # Create directories
    if not dry_run:
        os.makedirs(exam_dir, exist_ok=True)
        os.makedirs(chunks_dir, exist_ok=True)
    
    # Map old filename -> new path
    file_mappings = {
        f"{exam_code}.json": os.path.join(exam_dir, "exam.json"),
        f"{exam_code}_links.json": os.path.join(exam_dir, "links.json"),
        f"{exam_code}_metadata.json": os.path.join(exam_dir, "metadata.json"),
    }
    
    # Add chunk files
    for filename in os.listdir(data_dir):
        if filename.startswith(f"{exam_code}_chunk_") and filename.endswith('.json'):
            chunk_id = filename.replace(f"{exam_code}_chunk_", "").replace(".json", "")
            new_path = os.path.join(chunks_dir, f"chunk_{chunk_id}.json")
            file_mappings[filename] = new_path
    
    # Perform the migration
    for old_filename, new_path in file_mappings.items():
        old_path = os.path.join(data_dir, old_filename)
        
        if os.path.exists(old_path):
            if dry_run:
                print(f"  Would move: {old_filename} -> {new_path}")
            else:
                try:
                    shutil.move(old_path, new_path)
                    files_moved.append((old_filename, new_path))
                    print(f"  ✓ Moved: {old_filename} -> {new_path}")
                except Exception as e:
                    print(f"  ✗ Failed to move {old_filename}: {e}")
        else:
            if not dry_run:
                print(f"  - File not found: {old_filename}")
    
    return files_moved

def update_manifest_structure(data_dir):
    """Update manifest.json to reflect new structure"""
    manifest_path = os.path.join(data_dir, "manifest.json")
    manifest = load_json(manifest_path)
    
    if not manifest:
        print("No manifest.json found, creating new one")
        manifest = {"exams": [], "last_updated": "2025-07-13", "total_exams": 0}
    
    # Discover exams in new structure
    exams = []
    for item in os.listdir(data_dir):
        exam_dir = os.path.join(data_dir, item)
        if os.path.isdir(exam_dir) and os.path.exists(os.path.join(exam_dir, "exam.json")):
            exams.append(item)
    
    manifest["exams"] = sorted(exams)
    manifest["total_exams"] = len(exams)
    manifest["structure_version"] = "2.0"  # Mark as new structure
    
    if save_json(manifest, manifest_path):
        print(f"✓ Updated manifest with {len(exams)} exams")
        return True
    else:
        print("✗ Failed to update manifest")
        return False

def validate_migration(data_dir):
    """Validate that migration was successful"""
    issues = []
    
    # Check manifest
    manifest = load_json(os.path.join(data_dir, "manifest.json"))
    if not manifest:
        issues.append("manifest.json missing or corrupted")
    
    # Check each exam directory
    for exam_code in manifest.get("exams", []):
        exam_dir = os.path.join(data_dir, exam_code)
        
        if not os.path.isdir(exam_dir):
            issues.append(f"Exam directory missing: {exam_code}")
            continue
        
        # Check required files
        exam_json = os.path.join(exam_dir, "exam.json")
        if not os.path.exists(exam_json):
            issues.append(f"exam.json missing for {exam_code}")
        
        # Check if chunks exist and validate them
        chunks_dir = os.path.join(exam_dir, "chunks")
        if os.path.exists(chunks_dir):
            metadata_path = os.path.join(exam_dir, "metadata.json")
            if os.path.exists(metadata_path):
                metadata = load_json(metadata_path)
                if metadata and metadata.get("chunked"):
                    expected_chunks = metadata.get("total_chunks", 0)
                    actual_chunks = len([f for f in os.listdir(chunks_dir) 
                                       if f.startswith("chunk_") and f.endswith(".json")])
                    if actual_chunks != expected_chunks:
                        issues.append(f"Chunk count mismatch for {exam_code}: expected {expected_chunks}, found {actual_chunks}")
    
    return issues

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Migrate data structure to folder-per-exam organization')
    parser.add_argument('--data-dir', default='data', help='Data directory path')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without making changes')
    parser.add_argument('--exam', help='Migrate specific exam only')
    parser.add_argument('--validate', action='store_true', help='Validate migration only')
    
    args = parser.parse_args()
    
    data_dir = args.data_dir
    
    if not os.path.exists(data_dir):
        print(f"Data directory {data_dir} not found")
        return 1
    
    if args.validate:
        print("Validating migration...")
        issues = validate_migration(data_dir)
        if issues:
            print("Validation issues found:")
            for issue in issues:
                print(f"  - {issue}")
            return 1
        else:
            print("✓ Migration validation successful")
            return 0
    
    print(f"{'DRY RUN: ' if args.dry_run else ''}Migrating data structure in {data_dir}")
    
    # Discover exams
    if args.exam:
        exams_to_migrate = [args.exam]
    else:
        exams_to_migrate = discover_exams(data_dir)
    
    print(f"Found exams to migrate: {exams_to_migrate}")
    
    if not exams_to_migrate:
        print("No exams found to migrate")
        return 0
    
    # Migrate each exam
    total_moved = 0
    for exam_code in exams_to_migrate:
        print(f"\nMigrating {exam_code}...")
        files_moved = migrate_exam_files(exam_code, data_dir, args.dry_run)
        total_moved += len(files_moved)
    
    # Update manifest
    if not args.dry_run:
        print(f"\nUpdating manifest...")
        update_manifest_structure(data_dir)
        
        # Validate migration
        print(f"\nValidating migration...")
        issues = validate_migration(data_dir)
        if issues:
            print("Migration completed with issues:")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print("✓ Migration completed successfully")
    
    print(f"\nSummary: {total_moved} files {'would be' if args.dry_run else 'were'} moved")
    return 0

if __name__ == "__main__":
    exit(main())