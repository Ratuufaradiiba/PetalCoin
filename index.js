import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;
const API_URL = 'https://api.coingecko.com/api/v3/';
const config = {
  headers: {
    'x-cg-demo-api-key': 'CG-CrnkUjUhYyZWsQQiZ4CvpCW8',
  },
};
const vs = 'vs_currency=idr';

let search =''

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.get('/', async (req, res) => {
  try {
    const response = await axios.get(API_URL + 'coins/markets?' + vs + '&price_change_percentage=1h%2C24h%2C7d', config);
    const result = response.data;
    res.render('index.ejs', { content: result, search: search});
  } catch (error) {
    console.error('Failed to get request:', error.message);
  }
});

app.use(express.static('public'));
app.get('/id/coins/:id', async (req, res) => {
  try {
    const num = req.query.num || 1;
    const curr = req.query.currency || 'idr';
    const id = req.params.id;

    const response = await axios.get(API_URL + 'coins/' + id, config);
    const result = response.data;

    const dateStringAth = result.market_data.ath_date.idr
    const dateStringAtl = result.market_data.atl_date.idr
    const dateAth = new Date(dateStringAth);
    const dateAtl = new Date(dateStringAtl);
    const today = new Date();

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDateAth = dateAth.toLocaleDateString('en-US', options);
    const formattedDateAtl = dateAtl.toLocaleDateString('en-US', options);

    let diffYearsAth = today.getFullYear() - dateAth.getFullYear();
    let diffYearsAtl = today.getFullYear() - dateAtl.getFullYear();
    let diffMonthsAth = today.getMonth() - dateAth.getMonth();
    let diffMonthsAtl = today.getMonth() - dateAtl.getMonth();
    let diffDaysAth = today.getDate() - dateAth.getDate();
    let diffDaysAtl = today.getDate() - dateAtl.getDate();

    if (diffDaysAth < 0) {
      diffMonthsAth -= 1;
      diffDaysAth += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // Days in the previous month
    }
    if (diffDaysAtl < 0) {
      diffMonthsAtl -= 1;
      diffDaysAtl += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // Days in the previous month
    }
    if (diffMonthsAth < 0) {
      diffYearsAth -= 1;
      diffMonthsAth += 12;
    }
    if (diffMonthsAtl < 0) {
      diffYearsAtl -= 1;
      diffMonthsAtl += 12;
    }

    // Build the readable string
    let daysTextAth = '';
    let daysTextAtl = '';
    if (diffYearsAth > 0) {
      daysTextAth = diffYearsAth === 1 ? 'over 1 year' : `over ${diffYearsAth} years`;
    } else if (diffMonthsAth > 0) {
      daysTextAth = diffMonthsAth === 1 ? '1 month ago' : `${diffMonthsAth} months ago`;
    } else {
      daysTextAth = diffDaysAth === 1 ? '1 day ago' : `${diffDaysAth} days ago`;
    }
    
    if (diffYearsAtl > 0) {
      daysTextAtl = diffYearsAtl === 1 ? 'over 1 year' : `over ${diffYearsAtl} years`;
    } else if (diffMonthsAtl > 0) {
      daysTextAtl = diffMonthsAtl === 1 ? '1 month ago' : `${diffMonthsAtl} months ago`;
    } else {
      daysTextAtl = diffDaysAtl === 1 ? '1 day ago' : `${diffDaysAtl} days ago`;
    }
    
    const currentPrice = result.market_data.current_price[curr];
    const convertedValue = currentPrice ? num * currentPrice : num * result.market_data.current_price.idr;
    res.render('detail.ejs', { coin: result, num: num, currenc: curr, convertedValue, daysTextAth: `${formattedDateAth} (${daysTextAth})`, daysTextAtl: `${formattedDateAtl} (${daysTextAtl})` });
  } catch (error) {
    console.error('Failed to get Request:', error.message);
  }
});

app.get('/search', async (req, res) => {
try {
  let search = req.query.search || '';

  if (!search) {
    return res.redirect('/');
  }
  
  const response = await axios.get(`${API_URL}/search?query=${search}`, config);
  const result = response.data.coins; 
  
  res.render('index.ejs', {
    content: [], 
    filter: result, 
    search: search, 
  });
} catch (error) {
  console.error('Failed to get Request:', error.message);
  
}

});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
