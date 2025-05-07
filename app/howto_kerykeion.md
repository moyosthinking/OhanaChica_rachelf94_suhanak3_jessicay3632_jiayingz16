# how-to :: Use Kerykeion with Node.js
---
## Overview
This project shows how to use Kerykeion, a Python astrology library, within a Node.js app. This method lets Node.js call Python behind the scenes, making advanced astrology tools usable in web or bot projects.

### Estimated Time Cost: 0.5 hrs (0.56 if on Windows) 

### Prerequisites:

- Install kerykeion
   - Requires Python 3.9 or higher
   - If Windows : Download and Install [Build Tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
      - When installing, choose "Desktop development with C++" workload
      - This compiles some Python libraries from source
   - Run command
   ```
   pip3 install kerykeion
   ```
 - Install Node.js 

### Procedure:
1. Create a python file, import the correct packages, ex:
    ```
   from flask import Flask, jsonify
   from kerykeion import AstrologicalSubject
   app = Flask(__name__)

   @app.route("/")
   def astro():
      subject = AstrologicalSubject("Johnny Depp", 1963, 6, 9, 0, 0, "Owensboro", "US")
      return jsonify(subject.json(dump=False))

   if __name__ == "__main__":
      app.run(port=5000)
    ```
2. Run the Flask Server
   ```
   python astro_server.py
   ```
   and open in browser
   ```
   http://127.0.0.1:5000
   ```
3. Create a Node script
   ```
   const axios = require('axios');

   axios.get('http://127.0.0.1:5000/')
   .then(res => {
      console.log("Astrology result:", res.data);
   })
   .catch(err => {
      console.error("Error:", err.message);
   });
   ```
4. In a seperate terminal window, run the script
   ```
   node nodey.js
   ```

### Resources
* [Kerykeion](https://www.kerykeion.net/pydocs/kerykeion.html)
 
---

Accurate as of (last update): 2024-05-06

#### Contributors:  
Moyo Fagbuyi, pd5  

_Note: the two spaces after each name are important! ( <--burn after reading)  _
