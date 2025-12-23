from playwright.sync_api import sync_playwright
import json

def verify_markdown_and_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            # 1. Setup Data
            print("Injecting config...")
            page.goto("http://localhost:5173/")

            # User & Config
            regular_user = {
                'id': 'user-1',
                'email': 'user@example.com',
                'password': 'password',
                'role': 'user',
                'name': 'Regular User',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            # Custom Models (Text and Image)
            custom_models = [
                {'uuid': '1', 'name': 'Text Bot', 'id': 'gpt-3.5-turbo', 'provider': 'openai', 'type': 'text'},
                {'uuid': '2', 'name': 'Image Gen', 'id': 'dall-e-3', 'provider': 'openai', 'type': 'image'}
            ]

            js_script = f"""
                const users = JSON.parse(localStorage.getItem('brand_ai_users') || '[]');
                const cleanUsers = users.filter(u => u.email !== 'user@example.com');
                cleanUsers.push({json.dumps(regular_user)});
                localStorage.setItem('brand_ai_users', JSON.stringify(cleanUsers));

                localStorage.setItem('gaod_custom_models', JSON.stringify({json.dumps(custom_models)}));

                // Set invalid key to force simulation/error which is fine, we just check UI rendering
                localStorage.setItem('gaod_openai_key', 'invalid-sk-key');
            """
            page.evaluate(js_script)

            # 2. Login
            print("Logging in...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'user@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')
            page.wait_for_url("**/dashboard")

            # 3. Test Text Chat & Markdown
            print("Testing Text Chat & Markdown...")
            # We need to simulate a response with Markdown.
            # Since we can't easily intercept the fetch in this environment without mocking,
            # we'll rely on the simulation fallback which returns plain text.
            # HOWEVER, we can inject a message into the chatStore directly to test rendering.

            js_inject_msg = """
                const chats = JSON.parse(localStorage.getItem('brand_ai_chats') || '[]');
                if (chats.length > 0) {
                    chats[0].messages.push({
                        id: 'msg-test-md',
                        role: 'assistant',
                        content: '# Hello\\n**Bold Text**\\n- Item 1\\n- Item 2'
                    });
                    localStorage.setItem('brand_ai_chats', JSON.stringify(chats));
                }
            """
            # Reload page to pick up injected storage? Or just refresh.
            page.evaluate(js_inject_msg)
            page.reload()

            page.wait_for_selector('h1:has-text("Hello")')
            page.wait_for_selector('strong:has-text("Bold Text")')
            print("SUCCESS: Markdown rendered (H1 and Bold detected).")

            # 4. Test File Attachment UI
            print("Testing File Attachment UI...")
            # Set file input
            with page.expect_file_chooser() as fc_info:
                page.click('button[title="Attach file"]')
            file_chooser = fc_info.value
            # Create a dummy file
            # In playground, we might not have file access easily, but playwright can create buffers
            file_chooser.set_files({"name": "test.txt", "mimeType": "text/plain", "buffer": b"content"})

            # Check if preview appears
            page.wait_for_selector('text=test.txt')
            print("SUCCESS: File attachment preview visible.")

            # 5. Test Image Model Selection
            print("Testing Model Selection...")
            page.click('button:has-text("Text Bot")') # Open dropdown
            page.click('button:has-text("Image Gen")') # Select Image Gen

            # Verify selection
            page.wait_for_selector('button:has-text("Image Gen")')
            print("SUCCESS: Image model selected.")

            page.screenshot(path="verification/features_check.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_features.png")
            raise e

        finally:
            browser.close()

if __name__ == "__main__":
    verify_markdown_and_features()
