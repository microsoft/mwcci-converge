# FEATURE FLAGS SETUP

1. Install it from npm (npm i flagged).
2. Import the FlagsProvider in your code and wrap your application around it.(import { FlagsProvider } from 'flagged’)
3. The features prop you pass to FlagsProvider could be an array of strings or an object. If you decide to use an object you could also pass nested objects to group feature flags together(<FlagsProvider features={flags}>).
4. Import the Feature in your code and wrap your application around it(import { Feature } from 'flagged').
5. Pass the name of the feature you want to check for and a children value and it will not render the children if the feature is enabled..