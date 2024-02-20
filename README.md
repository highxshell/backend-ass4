## ASSIGNMENT 4 POPOV ARTEM | SE-2205
1. git clone https://github.com/highxshell/backend-ass4 .
2. npm install
3. node app.js
4. open browser at localhost:3000
5. you will see login page, click sign up and register, after that it will take you back to login page
6. when authorized you will see MAIN page, with items in well-designed blocks, each featuring a carousel showcasing the three pictures. 
7. next you can go to (1)CryptoGeckoAPI to fetch price for different cryptocurrencies, outputed by chart.
   1. examples for token names - bitcoin, ethereum, litecoin and others
   2. you can choose any timeline, but its recommended to keep this low
9. after that you can check (2)Currency Rate API with information about currency rates, where you can input different currencies and see their exchange rates
    1. examples for currency symbols - KZT, RUB, EUR, USD and others
    2. you also can input amount of base currency that you have, and will receive how much it will be in target currency 
11. then you can go to NASA APOD API and enjoy beautiful photos provided by NASA
12. to test admin page u should login with username - artem, and password - artem, after that go to the /admin route and see functionality
    1. there would be the functionality from previous assignment, and also the way to interact with blocks that are shown in main page
    2. admin page can be accesed only if you LOGGED IN and have an ADMIN status
    3. every other endpoints are protected by middleware and can be accesed only if you are logged in, if not - they will transfer you to login page

# deployed link - https://assignment3-1tgw.onrender.com
# username of ADMIN - artem, password - artem
