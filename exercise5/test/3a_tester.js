const readline = require('readline');
const fetch = require('node-fetch');
const chalk = require('chalk');
const ProgressBar = require('progress');
const util = require('util');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const items = [];
const users = [];

const generateItems = async (count) => {
  const names = await (await fetch(`http://names.drycodes.com/${count}?nameOptions=objects`)).json();
  const quotes = await (await fetch('https://type.fit/api/quotes')).json();

  const bar = new ProgressBar('  generating item data :current/:total [:bar] :elapsed sec ', {
    total: count
  });

  for (let i = 0; i < count; i++) {
    // populate the items array with random data
    items[i] = {
      name: names[i].replace('_', ' '),
      price: (Math.random() * (149.99 - 2.99) + 2.99).toFixed(2),
      description: quotes[i % quotes.length].text
    };

    bar.tick();
  }
};

const generateUsers = async (count) => {
  const { results } = await (await fetch(`https://randomuser.me/api/?results=${count}`)).json();

  const bar = new ProgressBar('  generating user data :current/:total [:bar] :elapsed sec ', {
    total: count
  });

  for (let i = 0; i < count; i++) {
    users[i] = {
      email: results[i].email,
      password: results[i].login.password
    };

    bar.tick();
  }
};

const testCreateItems = async (uri, iterations) => {
  const bar = new ProgressBar(' testing iteration :current/:total [:bar] :elapsed', {
    total: iterations
  });
  let success = 0;
  let fail = 0;
  const failed = [];
  for (let i = 0; i < iterations; i++) {
    let response;
    try {
      response = await fetch(`${uri}/createItem`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(items[i])
      });
    } catch (ex) {
      if (ex.code === 'ECONNREFUSED') {
        console.log(`Could not connect to the address. Are you sure the server is running on ${uri}?`);
        return;
      }
    }

    bar.tick();
    if (!response) {
      fail++;
      failed.push({
        user: users[i],
        code: undefined,
        message: 'Request completely failed. No response was returned.'
      });
    } else {
      if (response.status === 200) {
        const data = await response.json();
        if (data && data.success) success++;
        else {
          fail++;
          failed.push({
            user: users[i],
            code: response.status,
            expected: {
              success: true
            },
            received: data
          });
        }
      }
      else {
        fail++;
        failed.push({
          user: users[i],
          code: response.status,
          message: 'Internal server error'
        })
      }
    }
  }

  return {
    success,
    fail,
    failed
  };
};

const testCreateUser = async (uri, iterations) => {
  const bar = new ProgressBar(' testing iteration :current/:total [:bar] :elapsed', {
    total: iterations
  });
  let success = 0;
  let fail = 0;
  const failed = [];
  for (let i = 0; i < iterations; i++) {
    let response;
    try {
      response = await fetch(`${uri}/createUser`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(users[i])
      });
    } catch (ex) {
      if (ex.code === 'ECONNREFUSED') {
        console.log(`Could not connect to the address. Are you sure the server is running on ${uri}?`);
        return;
      }
    }

    bar.tick();
    if (!response) {
      fail++;
      failed.push({
        user: users[i],
        code: undefined,
        message: 'Request completely failed. No response was returned.'
      });
    } else {
      if (response.status === 200) {
        const data = await response.json();
        if (data === i) success++;
        else {
          fail++;
          failed.push({
            user: users[i],
            code: response.status,
            expected: i,
            received: data
          });
        }
      }
      else {
        fail++;
        failed.push({
          user: users[i],
          code: response.status,
          message: 'Internal server error'
        });
      }
    }
  }

  return {
    success,
    fail,
    failed
  };
}

rl.question('Server URI, address:port: (default: http://localhost:3000) http://', (uri) => {
  if (!uri) uri = 'localhost:3000'
  const address = uri.startsWith('http://') ? uri : `http://${uri}`;

  rl.question('Iterations? (default: 1000) ', async (iterations = 1000) => {
    if (!iterations) iterations = 1000;

    console.log(chalk.bgYellow.black('Generating random Item data...'));
    await generateItems(iterations);
    console.log(chalk.bgGreen.black('Generation complete.\n'));

    console.log(chalk.bgYellow.black('Generating random User data...'));
    await generateUsers(Math.ceil(iterations / 4));
    console.log(chalk.bgGreen.black('Generation complete.\n'));

    console.log(chalk.bgYellow.black('Testing POST /createItem.'));
    const t1 = await testCreateItems(address, iterations);
    if (t1.success) {
      console.log(chalk.bgGreen.black(`Finished testing POST /createItem. Succeeded: ${t1.success}`) + `${t1.fail ? chalk.bgRed(`Failed: ${t1.fail}`) : ''}`);
      if (t1.fail) {
        if (t1.fail > 5) {
          console.log(chalk.bgRed.black('Failed items (top 5):', util.inspect(t1.failed.slice(0, 5))));
        } else {
          console.log(chalk.bgRed.black('Failed items:', util.inspect(t1.failed)));
        }
      }
    } else {
      console.log(chalk.bgRed(' POST /createItem tests failed (all). Top 5 elements shown below. '));
      console.log(chalk.bgRed(util.inspect(t1.failed.slice(0, 5))));
    }

    console.log(chalk.bgYellow.black('\nTesting POST /createUser.'));
    const t2 = await testCreateUser(address, Math.ceil(iterations / 4));
    if (t2.success) {
      console.log(chalk.bgGreen.black(`Finished testing POST /createUser. Succeeded: ${t2.success}`) + `${t2.fail ? chalk.bgRed(` Failed: ${t2.fail}`) : ''}`);
      if (t2.fail) {
        if (t2.fail > 5) {
          console.log(chalk.bgRed.black('Failed items:', util.inspect(t2.failed.slice(0, 5))));
        }
        console.log(chalk.bgRed.black('Failed items:', util.inspect(t2.failed)));
      }
    } else {
      console.log(chalk.bgRed(' POST /createUser tests failed (all). Top 5 elements shown below. '));
      console.log(chalk.bgRed(util.inspect(t2.failed.slice(0, 5))));
    }

    rl.close();
  });
});
