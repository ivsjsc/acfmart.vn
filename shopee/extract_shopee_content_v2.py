import requests
from bs4 import BeautifulSoup
import json
import time
import os

def extract_text_from_html(html_content):
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, 'html.parser')
    # Remove script and style elements
    for script_or_style in soup(["script", "style"]):
        script_or_style.decompose()
    
    # Get text with a bit of structure
    text = soup.get_text(separator='\n')
    
    # Clean up whitespace
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)
    return text

def run_task():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
    
    # Mapping of categories and their sub-category IDs based on common Shopee structure
    # Since API is failing, I'll use the IDs I can find or navigate
    # Mua Sắm Cùng Shopee: 57
    # Khuyến Mãi & Ưu Đãi: 58
    # Thanh Toán: 59
    # Đơn Hàng & Vận Chuyển: 60
    # Trả Hàng & Hoàn Tiền: 61
    # Thông Tin Chung: 62
    
    categories = {
        "Mua Sắm Cùng Shopee": 57,
        "Khuyến Mãi & Ưu Đãi": 58,
        "Thanh Toán": 59,
        "Đơn Hàng & Vận Chuyển": 60,
        "Trả Hàng & Hoàn Tiền": 61,
        "Thông Tin Chung": 62
    }
    
    for cat_name, cat_id in categories.items():
        print(f"Processing {cat_name}...")
        all_cat_content = f"# {cat_name}\n\n"
        
        # Get subcategories for this category
        sub_url = f"https://help.shopee.vn/api/v4/helpcenter/get_sub_categories?category_id={cat_id}&region=VN"
        try:
            # Try with a slightly different approach if direct API fails
            # Sometimes Shopee needs specific cookies or headers
            resp = requests.get(sub_url, headers=headers)
            if resp.status_code != 200:
                print(f"Failed to get subcategories for {cat_name}")
                continue
                
            sub_categories = resp.json().get('data', {}).get('sub_categories', [])
            for sub in sub_categories:
                sub_id = sub['sub_category_id']
                sub_name = sub['sub_category_name']
                print(f"  - Sub: {sub_name}")
                
                # Get articles for subcategory
                art_url = f"https://help.shopee.vn/api/v4/helpcenter/get_articles_by_sub_category?sub_category_id={sub_id}&page=1&page_size=50&region=VN"
                art_resp = requests.get(art_url, headers=headers)
                articles = art_resp.json().get('data', {}).get('articles', [])
                
                for art in articles:
                    art_id = art['article_id']
                    art_title = art['title']
                    
                    # Get article content
                    content_url = f"https://help.shopee.vn/api/v4/helpcenter/get_article?article_id={art_id}&region=VN"
                    content_resp = requests.get(content_url, headers=headers)
                    art_data = content_resp.json().get('data', {})
                    html_body = art_data.get('content', '')
                    clean_text = extract_text_from_html(html_body)
                    
                    all_cat_content += f"## {art_title}\n\n{clean_text}\n\n---\n\n"
                    time.sleep(0.2)
                    
            # Save to file
            safe_name = cat_name.replace(" ", "_").replace("&", "and")
            with open(f"/home/ubuntu/Shopee_{safe_name}.md", "w", encoding="utf-8") as f:
                f.write(all_cat_content)
                
        except Exception as e:
            print(f"Error in {cat_name}: {e}")

if __name__ == "__main__":
    run_task()
