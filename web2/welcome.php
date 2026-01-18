<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 60px 40px;
            text-align: center;
            max-width: 600px;
            width: 100%;
            animation: fadeIn 0.6s ease-in;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 20px;
            font-weight: 700;
        }

        .welcome-message {
            color: #666;
            font-size: 1.2em;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .timestamp {
            color: #999;
            font-size: 0.9em;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }

        .emoji {
            font-size: 3em;
            margin-bottom: 20px;
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <span class="emoji">👋</span>
        <h1>Welcome!</h1>
        <div class="welcome-message">
            <p>Thank you for visiting our page. We're excited to have you here!</p>
            <p style="margin-top: 15px;">This is a simple PHP welcome page to get you started.</p>
        </div>
        <div class="timestamp">
            <?php
            date_default_timezone_set('UTC');
            echo "Page loaded on: " . date('F j, Y \a\t g:i A');
            ?>
        </div>
    </div>
</body>
</html>

