import requests
import sys
import json

def search_youtube_shorts(query, api_key):
    """Search YouTube for Shorts based on the input query."""
    # URL for the YouTube search API
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",  # We are only looking for video results
        "videoDuration": "short",  # Filter for short videos (YouTube Shorts typically are under 60 seconds)
        "key": api_key
    }

    # Send request to YouTube API
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        video_links = []
        
        for item in data.get("items", []):
            # Get video ID from the response
            video_id = item["id"].get("videoId")
            if video_id:
                # Format it as a YouTube Shorts link
                shorts_url = f"https://www.youtube.com/shorts/{video_id}"
                video_links.append(shorts_url)
        
        # Print the video links as a JSON array to stdout
        print(video_links)
    else:
        # Print error message as a JSON object to stdout
        error_message = {
            "error": f"Error searching YouTube: {response.status_code}",
            "details": response.json()
        }
        print(json.dumps(error_message))

if __name__ == "__main__":
    # Check if the script received the correct number of arguments
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python script.py <query> <api_key>"}))
        sys.exit(1)

    # Read the query and API key from the command-line arguments
    query = sys.argv[1]
    api_key = sys.argv[2]

    # Search for YouTube Shorts and print the results
    search_youtube_shorts(query, api_key)
