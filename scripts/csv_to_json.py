#!/usr/bin/env python3
"""
CSV to JSON converter for certifications
Reads certs_template.csv and generates JSON files organized by industry
"""

import csv
import json
from pathlib import Path
from typing import Dict, List, Any

def parse_csv_value(value: str, field_type: str) -> Any:
    """Parse CSV value based on expected field type"""
    if not value or value.lower() in ['n/a', 'none', '']:
        return None
    
    if field_type == 'int':
        try:
            return int(value)
        except:
            return value
    elif field_type == 'float':
        try:
            return float(value.strip('%'))
        except:
            return value
    elif field_type == 'bool':
        return value.lower() in ['true', 'yes', '1']
    elif field_type == 'array':
        # Split by comma and strip whitespace
        return [item.strip() for item in value.split(',') if item.strip()]
    else:
        return value

def read_certifications_csv(csv_path: str) -> List[Dict[str, Any]]:
    """Read CSV file and return list of certification dictionaries"""
    certifications = []
    
    field_types = {
        'id': 'int',
        'difficulty': 'int',
        'duration_weeks': 'int',
        'study_hours': 'int',
        'exam_duration_minutes': 'int',
        'pass_rate_percent': 'int',
        'valid_years': 'int',
        'renewal_required': 'bool',
        'salary_boost_low': 'int',
        'salary_boost_high': 'int',
        'worth_it_rating': 'float',
        'trending': 'bool',
        'job_postings_count': 'int',
        'skills': 'array',
        'primary_skills': 'array',
        'secondary_skills': 'array',
        'target_job_titles': 'array',
        'next_certs': 'array',
    }
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cert: Dict[str, Any] = {}
            
            for key, value in row.items():
                if key in field_types:
                    parsed_value = parse_csv_value(value, field_types[key])
                    if parsed_value is not None:
                        cert[key] = parsed_value
                else:
                    if value and value.lower() not in ['n/a', 'none']:
                        cert[key] = value
            
            certifications.append(cert)
    
    return certifications

def group_by_industry(certifications: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Group certifications by industry"""
    grouped = {}
    
    for cert in certifications:
        industry = cert.get('industry', 'other')
        if industry not in grouped:
            grouped[industry] = []
        grouped[industry].append(cert)
    
    return grouped

def write_json_files(grouped_certs: Dict[str, List[Dict[str, Any]]], output_dir: str) -> None:
    """Write JSON files for each industry"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    for industry, certs in grouped_certs.items():
        file_path = output_path / f"{industry}.json"
        
        # Sort by id
        certs_sorted = sorted(certs, key=lambda x: x.get('id', 0))
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(certs_sorted, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Created {file_path} with {len(certs)} certifications")

def main():
    script_dir = Path(__file__).parent.parent  # Go up one level to project root
    csv_file = script_dir / 'certs_template.csv'
    certs_dir = script_dir / 'certs'
    
    if not csv_file.exists():
        print(f"❌ CSV file not found: {csv_file}")
        return
    
    print(f"📖 Reading certifications from {csv_file}...")
    certifications = read_certifications_csv(str(csv_file))
    print(f"✅ Loaded {len(certifications)} certifications")
    
    print("\n📁 Grouping by industry...")
    grouped = group_by_industry(certifications)
    print(f"✅ Found {len(grouped)} industries: {', '.join(sorted(grouped.keys()))}")
    
    print("\n💾 Writing JSON files...")
    write_json_files(grouped, str(certs_dir))
    
    print("\n✨ Done! Your database is ready to use.")
    print(f"\nSummary:")
    for industry in sorted(grouped.keys()):
        print(f"  - {industry}: {len(grouped[industry])} certs")

if __name__ == '__main__':
    main()
