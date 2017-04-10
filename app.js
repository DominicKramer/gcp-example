/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ejs = require('ejs');
const express = require('express');

const Language = require('@google-cloud/language');

const app = express();

const PORT = 8080;

app.get('/', function(req, res) {
  sendViewFile(res, 'index.html');
});

app.get('/process_phrase', function(req, res) {
  const text = req.query.phrase || ' ';
  analyzeText(text).then(function(results) {
    sendViewFile(res, 'result.html', {
      input: text,
      sentiment: results.sentiment.score >= 0 ? 'Positive' : 'Negative',
      analysis: results.analysis
    });
  }).catch(function(e) {
    res.end('Error: ' + e.message);
  });
});

app.listen(PORT, function() {
  console.log('Listening to port ' + PORT);
});

function sendViewFile(res, filename, data) {
  const fullPath = path.join(__dirname, 'views', filename);
  fs.readFile(fullPath, 'utf8', function(err, text) {
    if (err) {
      return res.end('Error: ' + err.message);
    }

    return res.end(ejs.render(text, data || {}));
  });
}

function analyzeText(text) {
  const document = Language().document({
    content: text
  });

  return Promise.all([document.detectEntities(),
                      document.detectSentiment()])
                .then(function(values) {
                  return {
                    analysis: values[0][0],
                    sentiment: values[1][0]
                  };
                });
}
