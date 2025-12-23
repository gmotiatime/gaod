from playwright.sync_api import sync_playwright
import json
import time

def verify_vertex():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("1. Setup Config...")
            page.goto("http://localhost:5173/")

            user = {
                'id': 'user-vertex-1',
                'email': 'vertex@example.com',
                'password': 'password',
                'role': 'user',
                'name': 'Vertex User',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            # Using Vertex model
            custom_models = [
                {'uuid': '1', 'name': 'Flash Lite', 'id': 'gemini-2.5-flash-lite', 'provider': 'vertex'}
            ]

            js_script = f"""
                localStorage.clear();
                const users = [{json.dumps(user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
                localStorage.setItem('gaod_custom_models', JSON.stringify({json.dumps(custom_models)}));

                // Set Fake Vertex Key
                localStorage.setItem('gaod_vertex_key', 'fake-vertex-key');
            """
            page.evaluate(js_script)

            print("2. Login...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'vertex@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')
            page.wait_for_url("**/dashboard")
            page.wait_for_timeout(1000)

            print("3. Test Vertex API Call...")

            # Intercept request to aiplatform
            api_called = False
            def handle_vertex(route):
                nonlocal api_called
                api_called = True
                print(f"Intercepted URL: {route.request.url}")
                if "aiplatform.googleapis.com" in route.request.url and "gemini-2.5-flash-lite" in route.request.url:
                    route.fulfill(
                        status=200,
                        content_type="application/json",
                        body=json.dumps({
                            "candidates": [{
                                "content": {
                                    "parts": [{"text": "Hello from Vertex AI!"}]
                                }
                            }]
                        })
                    )
                else:
                    route.continue_()

            page.route("**/*", handle_vertex)

            page.fill('textarea', 'Hello Vertex')
            page.click('button[type="submit"]')

            page.wait_for_selector('text=Hello from Vertex AI!', timeout=10000)

            if api_called:
                print("SUCCESS: Vertex API endpoint called.")
            else:
                print("FAILURE: Vertex API endpoint NOT called.")

            page.screenshot(path="verification/vertex_check.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_vertex.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_vertex()
