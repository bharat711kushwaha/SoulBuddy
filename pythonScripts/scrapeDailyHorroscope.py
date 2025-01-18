import requests
from bs4 import BeautifulSoup
import sys

def fetch_horoscope(sign, date):
    url = f"https://www.astrologycharts.net/horoscope/daily/{sign}/{date}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx and 5xx)
    except requests.exceptions.RequestException as e:
        return f"Error fetching horoscope: {e}"

    soup = BeautifulSoup(response.content, 'html.parser')
    horoscope_section = soup.find('div', class_='page_text__EztTz')
    if horoscope_section:
        return horoscope_section.get_text(strip=True)
    else:
        return "Horoscope content not found. The webpage structure might have changed."

if __name__ == "__main__":
    # Read arguments from the command line
    if len(sys.argv) != 3:
        print("Usage: python script.py <sign> <date>")
        sys.exit(1)
    
    sign = sys.argv[1].lower()
    date = sys.argv[2]
    
    try:
        horoscope = fetch_horoscope(sign, date)
        print(horoscope)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
