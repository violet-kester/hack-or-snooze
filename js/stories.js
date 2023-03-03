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

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

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
  // const user = localStorage.getItem("username");
  const storyToAdd = await storyList.addStory(currentUser, {title, author, url});
  const storyToAddLi = generateStoryMarkup(storyToAdd);
  $allStoriesList.prepend(storyToAddLi);
}

$('#submit-form').on('submit', addNewStoryToPage);


/**  Gets list of favorites, generates their HTML, and puts on page.
 */

async function addFavoritesToPage(evt) {
  evt.preventDefault();
  console.debug('addFavoritesToPage');

  // hide stories list, all user forms, and empty favorites list
  hidePageComponents();
  $allFavsList.empty();

  // loop through all of our stories and generate HTML for them
  for (let fav of currentUser.favorites) {
    const $fav = generateStoryMarkup(fav);
    $allFavsList.append($fav);
    const $starIcon = $fav.find('.bi')[0];
    $starIcon.classList.remove("bi-star");
    $starIcon.classList.add("bi-star-fill");

  }
  $allFavsList.show();
}

$('#nav-favorites').on('click', addFavoritesToPage);

/** Adds or removes a story from favorites when
 *  the star icon is clicked.
 */

function toggleFavorite(evt) {
  evt.preventDefault();
  console.log('toggleFavorite');
  const $starIcon = evt.target;
  const starIconClasses = Array.from($starIcon.classList);
  if (starIconClasses.includes("bi-star")) {
    $starIcon.classList.remove("bi-star");
    $starIcon.classList.add("bi-star-fill");
  } else if (starIconClasses.includes("bi-star-fill")) {
    $starIcon.classList.remove("bi-star-fill");
    $starIcon.classList.add("bi-star");
  }
}

$('.stories-container').on('click', '.bi', toggleFavorite);
