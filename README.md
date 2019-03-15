# mint-crypto
Track crypto assets in Mint.com; automatically check and update wallets for various coins periodically so you'll always have an accurate understanding of current holdings

Setup and Configuration
----
Before beginning, you'll need to:
* have the Google Chrome browser installed,
* have a Mint.com account,
* have this repository cloned locally,
* and have NodeJS and NPM installed globally.

After those prerequisites are met, follow these steps to get the script working for your needs.

1. Create a new "Cash" or property account for each type of crypto asset you hold. Ex: If you hold BTC and ETH, create 2 cash accounts with whatever names you want (though choosing a reasonable acct name will help with a future step).
1. Modify `index_async.js` file to add Mint credentials (username, password).
1. Also in `index_async.js`, uncomment the block comment marked with `//UNCOMMENT BLOCK TO LIST ACCOUNTS`, that is, remove the `/*` and `*/` chars at beginning and end of block.
1. Install all script dependencies by running `npm install` in terminal, after `cd`ing to location of repo.
1. Run script by executing `node index.js`
1. A webdriver controlled instance of Chrome browser will open, navigate to Mint and log in. Depending on your account's security settings, you may need to go thru a 2 factor auth step at this time.
1. ??