"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  // DONE: Return host name, not url
  // TODO: Url class - check it out. make an instance of it and extract the host name
  // to handle all cases
  getHostName() {
    // UNIMPLEMENTED: complete this function!
    // const hostName = this.url.replace("http://", "");
    const hostURL = new URL(this.url);
    const hostName = hostURL.host;
    return hostName;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  // DONE: add the story to the in-memory story list
  async addStory(user, newStory) {
    // UNIMPLEMENTED: complete this function!
    console.debug('addStory');
    console.debug(typeof user);
    // console.debug(newStory);
    const token = user.loginToken;
    let response = await axios.post(`${BASE_URL}/stories`, {
        token: token,
        story: newStory
      }, token);
      let addedStory = response.data.story;
      const storyToAdd = new Story(addedStory);
      storyList.stories.push(storyToAdd);
      return storyToAdd;
    }
  }



/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }


/**
 * Method that lets user favorite a story
 * Accepts a Story instance and makes a post
 * request to the API to update server side
 */
  async addFavorite(story){
    const userToken = currentUser.loginToken;
    console.debug("addFavorite")
    //console.log(response);
    let response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${story.storyId}`,
      method: "POST",
      data: { token: userToken }
  });

    currentUser.favorites.push(story);
}

/**
 * Method that lets user remove favorite story
 * Accepts a Story instance and makes a delete
 * request to the API to update server side
 */

  async removeFavorite(story){
    const userToken = currentUser.loginToken;
    let response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${story.storyId}`,
      method: "DELETE",
      data: { token: userToken }
  });

    const favs = currentUser.favorites;
    for(let i=0; i<favs.length; i++){
      console.log("favs[i]", favs[i].storyId);
      console.log("story storyId", story.storyId)
      if(favs[i].storyId === story.storyId){
        favs.splice(i, 1);

      }

    }
    currentUser.favorites = favs;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *  we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
}
