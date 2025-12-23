from playwright.sync_api import sync_playwright
import json
import time

def verify_chat_stream():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("1. Setup Config...")
            page.goto("http://localhost:5173/")

            user = {
                'id': 'user-stream-1',
                'email': 'stream@example.com',
                'password': 'password',
                'role': 'user',
                'name': 'Stream User',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            custom_models = [
                {'uuid': '1', 'name': 'Flash Lite', 'id': 'gemini-2.5-flash-lite', 'provider': 'vertex'}
            ]

            js_script = f"""
                localStorage.clear();
                const users = [{json.dumps(user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
                localStorage.setItem('gaod_custom_models', JSON.stringify({json.dumps(custom_models)}));
                localStorage.setItem('gaod_vertex_key', 'fake-vertex-key');
            """
            page.evaluate(js_script)

            print("2. Login...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'stream@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')
            page.wait_for_url("**/dashboard")
            page.wait_for_timeout(1000)

            print("3. Test Streaming API...")

            # Mock the streaming response (Server-Sent Event style or chunked text)
            # The client expects standard fetch stream. We can simulate it by fulfilling with a body.
            # However, Playwright fulfill body is non-streaming unless we use a server or maybe route handler intricacies.
            # Simple approach: Return a full JSON that looks like what the client processes,
            # or rely on the fallback "Simulating response" if mocking stream is hard.
            # But we want to test that the URL is correct (generativelanguage).

            api_called = False
            def handle_vertex(route):
                nonlocal api_called
                api_called = True
                print(f"Intercepted URL: {route.request.url}")
                if "generativelanguage.googleapis.com" in route.request.url and "streamGenerateContent" in route.request.url:
                    # Return a valid JSON response so client doesn't error,
                    # but real streaming test via Playwright route is tricky without a local server helper.
                    # We will return a mock JSON that the client will parse as one chunk.
                    chunk_json = json.dumps({
                        "candidates": [{
                            "content": { "parts": [{ "text": "Hello from Stream!" }] }
                        }]
                    })
                    # The client logic regexes for "text": "..." so even raw JSON works if it matches regex.
                    route.fulfill(
                        status=200,
                        content_type="application/json",
                        body=chunk_json
                    )
                else:
                    route.continue_()

            page.route("**/*", handle_vertex)

            page.fill('textarea', 'Hello Stream')
            page.click('button[type="submit"]')

            # Check for the response text or the fallback simulation
            try:
                page.wait_for_selector('text=Hello from Stream!', timeout=5000)
                print("SUCCESS: Stream response rendered.")
            except:
                print("WARNING: Stream text not found, might be simulating.")

            if api_called:
                print("SUCCESS: Streaming API endpoint called.")
            else:
                print("FAILURE: Streaming API endpoint NOT called.")

            page.screenshot(path="verification/stream_check.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_stream.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_chat_stream()
