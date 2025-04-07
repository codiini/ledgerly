# Ledgerly

This repository contains code for my school coursework (Java and Web Development)

This project helps Small and Medium-sized businesses manage and keep track of debt or credit sales. All of the components, pages, and composables are documented using JSDOC. 

## Installation Instructions
First, clone this repository to your local machine:

```sh
#Over HTTPS
git clone https://github.com/codiini/ledgerly.git

#Over SSH
git clone git@github.com:codiini/ledgerly.git
```

Next, using your terminal, navigate into the folder containing the project and install all Node dependencies using the following command:
```sh
npm install
```
Once done, at the project's root folder, create a `.env` file, copy the contents of the `.env.example` file, and then set the empty properties to the corresponding values provided (In the Presentation file).

Lastly, to start the development server, run the command:

```sh
npm run dev
```

And Viola! The app should be running at `http://localhost:3000`. Head on to the browser to check it out. 

If you don't want to have to go through creating an account, you can use the following test credentials.

```sh 
- Email: admin@test.com
- Password: admin@test.com
```

<!-- ## TODOs

- [x] Twilio Integration for SMS support
- [ ] Convert to PWA and Local first architecture -->
