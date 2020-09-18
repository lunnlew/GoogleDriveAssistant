const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();
const { bindRoute } = require('./bindRoute');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  credentials: true,
  origin: true
}));
app.set('port', process.env.PORT || 3000);

class Backend {
  async start () {
    bindRoute(app, express).listen(app.get('port'), async function () {
      console.log('Backend server listening on port ' + app.get('port'));
    });
  }
}

(async () => {
  await (new Backend).start()
})();