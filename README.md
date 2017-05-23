# About this app
This is an online, collaborative implementation of Ela Ben Ur's design tool [**Innovators' Compass**](http://innovatorscompass.org). It's an attempt at reducing paper waste, while allowing more robust collaboration and storage.

[Take it for a spin](http://innovatorscompass.org)

# Non-User Oriented Design
The app does not ask you to create an account: this makes it faster to get started with it. This means that usernames are non-persistent, so you can sign in with different names each time. A compass is not attached to your username, since you as a user don't exist in the database. 

When you join a workspace with editing rights, you are assigned a color for both your sticky notes and chat messages. Your color changes when you refresh the page, or log in from somewhere else.

Compasses are kept track of by their eight-character alphanumeric codes. Each compass comes with one code that grants editing access, and one that grants view-only access. **Do not lose the codes to an important compass**.

When creating a compass, you can have me email you the codes, so you don't forget to store them somewhere. The email will come from innovatorscompass@yahoo.com. Yes, **yahoo.com**.

# Getting started

Go to [http://icompass.hieuqn.com](http://icompass.hieuqn.com) and follow the login steps.

There is also a [tutorial](http://icompass.hieuqn.com/tutorial); some of its information will be repeated below.

# FYI

## Reduce
I'm using a sandbox instance of Mongo that allows 500Mb, so if you can delete a compass you won't need anymore that'll be great!

## Key bindings
Actions are bound to keys help with productivity:

- `n`ote
- `d`oodle
- `s`idebar
- `c`hat

## Stickies
The sticky note look is in the spirit of how I learnt and used the compass:

- **Compact mode** (top right corner) will set a max height for stickies and make images smaller, making it easier for you to see stickies.
- Stickies can carry up to 300 characters.
- You can link to images.
- You can create doodles. A small doodle is roughly 12000 characters, so they *may* cause some lag.
- Stickies can be dragged wherever, just like in real life.
- Overcrowding is an issue for large compasses, so single click to bring a note to the front.
- Double click to edit a note's contents. You can't edit doodles (*kinda* like in real life).
- Pressing `Esc` when creating/editing a note/doodle closes the form.

## Sidebar
The sidebar is your `statusline`, it

- shows your compass codes.
- reminds you of the key bindings if you forget.
- lists online collaborators and their colors.
- lets you save a PDF of your compass (which honestly is pretty terrible). I'd recommend just taking a screenshot.
- has a **delete compass** button that you definitely should use.
- and more...

## Chat
Is supported. Messages do not persist: if you refresh or log out, they're gone for you.