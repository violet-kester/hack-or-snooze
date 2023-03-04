"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
// TODO: rewrite icon classes so that current favorites are reflected when page is refreshed
// is it in the fav list? use a ternary
function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup");

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <i class="bi bi-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** addNewStoryToPage: submit story form submit handler.
 *
 *  Gets story data from the form,
 *  calls addStory to create a new Story object,
 *  and displays this story on the page.
 */

async function addNewStoryToPage(evt) {
  evt.preventDefault();
  const title = $('#create-title').val();
  const author = $('#create-author').val();
  const url = $('#create-url').val();
  const storyToAdd = await storyList.addStory(currentUser, { title, author, url });
  const storyToAddLi = generateStoryMarkup(storyToAdd);
  $allStoriesList.prepend(storyToAddLi);
}

$('#submit-form').on('submit', addNewStoryToPage);


/**  Gets list of favorites, generates their HTML, and puts on page.
 */

function addFavoritesToPage(evt) {
  evt.preventDefault();
  console.debug('addFavoritesToPage');

  // hide stories list, all user forms, and empties favorites list
  hidePageComponents();
  $allFavsList.empty();

  // TODO: lines 90-93 are unnecessary once above todo is addressed
  // loop through all of our stories and generate HTML for them
  for (let fav of currentUser.favorites) {
    const $fav = generateStoryMarkup(fav);
    $allFavsList.prepend($fav);
    const $starIcon = $fav.find('.bi')[0];
    $starIcon.classList.remove("bi-star");
    $starIcon.classList.add("bi-star-fill");
  }
  $allFavsList.show();
}

// TODO: group this nav event handler into the nav.js file
$('#nav-favorites').on('click', addFavoritesToPage);

/** Adds or removes a story from favorites when the star icon is clicked.
 *  - toggles the star icon.
 *  - adds/removes favorites to/from server
 *  - updates UI
 */

async function toggleFavorite(evt) {
  evt.preventDefault();
  console.log('toggleFavorite');

  //find star clicked, build array from class names, extract story id
  const $starIcon = evt.target;
  const starIconClasses = Array.from($starIcon.classList);
  const storyId = $starIcon.closest('li').getAttribute('id');

  // TODO: this should be a static method on the Story class.
  // (axios requests are all handled in models.js.)
  // make get request to receive story data
  const response = await axios({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "GET"
  });

  // create new instance of Story
  const currentStory = new Story(response.data.story);
  console.log(currentStory);

  // if story is not a favorite
  if (starIconClasses.includes("bi-star")) {
    await currentUser.addFavorite(currentStory);
    $starIcon.classList.remove("bi-star");
    $starIcon.classList.add("bi-star-fill");
  // if story is a favorite
  } else if (starIconClasses.includes("bi-star-fill")) {
    await currentUser.removeFavorite(currentStory);
    $starIcon.classList.remove("bi-star-fill");
    $starIcon.classList.add("bi-star");
  }
  // updateUserFavorites(currentStory);
}

// async function updateUserFavorites(currentStory) {
//   console.debug('updateUserFavorites');
//   console.log(currentStory);
//   console.log(currentUser.favorites.includes(currentStory));

//   NOT WORKING: condition evaluates to false.
//   Is there an easy way to check if currentStory exists is the user's favorites
//   without iterating over the array of favorites?
//   (currentUser.favorites.includes(currentStory))
//       ? await currentUser.removeFavorite(currentStory)
//       : await currentUser.addFavorite(currentStory);
//   }

$('.stories-container').on('click', '.bi', toggleFavorite);
