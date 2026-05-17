import requests
import json
import time
import os
import re

def clean_html(html_content):
    if not html_content:
        return ""
    # Simple regex to remove HTML tags and keep text
    text = re.sub('<[^>]*>', ' ', html_content)
    # Remove multiple spaces
    text = re.sub('\s+', ' ', text).strip()
    return text

def fetch_content():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
    }
    
    # Read the list of articles (generated in previous step)
    try:
        with open('/home/ubuntu/shopee_articles_list.json', 'r', encoding='utf-8') as f:
            articles = json.load(f)
    except FileNotFoundError:
        print("Article list not found. Please run the list collector first.")
        return

    # To avoid overwhelming, we will process category by category
    results = {}
    
    # Limiting to first 50 articles for a demo/initial batch to ensure stability
    # In a real scenario, we would loop through all but might need to handle huge data
    for i, art in enumerate(articles[:100]): # Processing first 100 for now
        art_id = art['article_id']
        title = art['title']
        main_cat = art['main_category']
        
        print(f"[{i+1}/{len(articles)}] Fetching: {title}")
        
        url = f"https://help.shopee.vn/api/v4/helpcenter/get_article?article_id={art_id}&region=VN"
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json().get('data', {})
                content_html = data.get('content', '')
                content_text = clean_html(content_html)
                
                if main_cat not in results:
                    results[main_cat] = []
                
                results[main_cat].append({
                    "title": title,
                    "content": content_text
                })
            else:
                print(f"Failed to fetch {art_id}")
        except Exception as e:
            print(f"Error fetching {art_id}: {e}")
        
        time.sleep(0.3) # Politeness

    # Save results to markdown files per category
    for cat, items in results.items():
        filename = f"/home/ubuntu/Shopee_{cat.replace(' ', '_')}.md"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"# Mục: {cat}\n\n")
            for item in items:
                f.write(f"## {item['title']}\n")
                f.write(f"{item['content']}\n\n")
                f.write("---\n\n")
        print(f"Saved {cat} to {filename}")

if __name__ == "__main__":
    fetch_content()
