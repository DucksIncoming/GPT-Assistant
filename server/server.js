// Imports
const openai = require('openai');

const express = require('express');
const fs = require('fs');

// Server settings
const port = 5000
const keyPath = 'key.txt';

const app = express();

try {
  if (!fs.existsSync(keyPath)) {
    fs.mkdirSync(keyPath);
  }
} catch (err) {
  console.error(err);
}

app.get('/key', function(req, res) {
    fs.readFile(keyPath, "utf-8", (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            res.send(data);
        }
    });
});

app.listen(port, () => {
    console.log("GPTAssistant server started on port " + port.toString());
});

app.get("/response", async function(req, res) {
    try {
        const response = await openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Please generate a random haiku."},
            ]
        );

        res.send(response['choices'][0]['message']['content']);
    }
    catch (e) {
        let failResponse = JSON.stringify({
            'choices': {
                0: {
                    'message': {
                        'content': 'Failed :('
                    }
                }
            }
        });

        res.send(failResponse);
    }
}); 