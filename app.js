
class App {
  constructor() {
    this.$app = document.querySelector('#app');
    this.$firebaseAuthcontainer = document.querySelector('#firebaseui-auth-container');
    this.$logOutBotton = document.querySelector('#log-out-btn');
    this.$postPage = document.querySelector('.post-page');
    this.$uploadButton = document.querySelector('#post-btn');
    this.$imageUpload = document.querySelector('#image-upload');
    this.$postCaption = document.querySelector('#post-caption');
    this.$postButton = document.querySelector('#redirect-button');
    this.$post = document.querySelector('.post');

    this.userId = null; // Initialize user ID

    this.addEventListener();
    // Initialize the FirebaseUI Widget using Firebase.
    this.ui = new firebaseui.auth.AuthUI(auth);
    this.handleAuth();
    this.handleLogOut();
  }

  handleAuth() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.userId = user.uid; // Store the user's ID
        this.redirectToApp();
        this.displayUserPosts();
      } else {
        this.redirectToAuth();
      }
    });
  }

  redirectToApp() {
    this.$firebaseAuthcontainer.style.display = 'none';
    this.$postPage.style.display = 'none';
    this.$app.style.display = 'block';
  }

  redirectToAuth() {
    this.$firebaseAuthcontainer.style.display = 'block';
    this.$postPage.style.display = 'none';
    this.$app.style.display = 'none';
    this.displayUserPosts();

    this.ui.start('#firebaseui-auth-container', {
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          this.userId = authResult.user.uid;
          this.redirectToApp();
        },
      },
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
    });
  }

  handleLogOut() {
    firebase.auth().signOut().then(() => {
      this.redirectToAuth();
    }).catch((error) => {
      console.log("ERROR OCCURRED", error);
    });
  }

  addEventListener() {
    this.$logOutBotton.addEventListener("click", () => {
      this.handleLogOut();
    });

    // Redirect to the post-page
    this.$uploadButton.addEventListener("click", () => {
      this.$app.style.display = 'none';
      this.$postPage.style.display = 'block';
    });

    this.$postButton.addEventListener("click", () => {
      this.uploadImageAndCreatePost();
    });
  }  

  async uploadImageAndCreatePost() {
    const imageFile = this.$imageUpload.files[0];
    const postCaption = this.$postCaption.value;

    if (!imageFile || !postCaption) {
      alert("Please select an image and enter a caption.");
      return;
    }

    // Upload the image to Firebase Storage
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(`images/${Date.now()}_${imageFile.name}`);

    try {
      await imageRef.put(imageFile);
      const imageURL = await imageRef.getDownloadURL();

      // Create the post object and store it in the Firebase Firestore
      const postsRef = firebase.firestore().collection("posts");
      const newPost = {
        userId: this.userId,
        caption: postCaption,
        photoURL: imageURL,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await postsRef.add(newPost);
      alert("Post created successfully!");
      this.$postCaption.value = "";

      // Redirect to the app after a successful post upload
      this.redirectToApp();

      // Display the updated user posts
      this.displayUserPosts();
      
    } catch (error) {
      console.error("Error uploading image or creating post:", error);
      alert("An error occurred while creating the post.");
    }
    
  }

  async displayUserPosts() {
    const postsContainer = document.querySelector('#posts-container');
    postsContainer.innerHTML = ''; // Clear previous posts
  
    // Fetch user's posts from Firestore
    const postsRef = firebase.firestore().collection('posts');
    const userPosts = await postsRef.where('userId', '==', this.userId).get();
  
    // Display each post in the UI
    userPosts.forEach((doc) => {
      const post = doc.data();
      const postElement = document.createElement('.post');
      postElement.innerHTML = `
      <div class="post">
      <div class="header">
        <div class="profile-area">
          <div class="post-pic">
            <img
              alt="jayshetty's profile picture"
              class="_6q-tv"
              data-testid="user-avatar"
              draggable="false"
              src="${post.photoURL}"
            />
          </div>
          <span class="profile-name">${post.userId}</span>
        </div>
        <div class="options">
          <div
            class="Igw0E rBNOH YBx95 _4EzTm"
            style="height: 24px; width: 24px"
          >
            <svg
              aria-label="More options"
              class="_8-yf5"
              fill="#262626"
              height="16"
              viewBox="0 0 48 48"
              width="16"
            >
              <circle
                clip-rule="evenodd"
                cx="8"
                cy="24"
                fill-rule="evenodd"
                r="4.5"
              ></circle>
              <circle
                clip-rule="evenodd"
                cx="24"
                cy="24"
                fill-rule="evenodd"
                r="4.5"
              ></circle>
              <circle
                clip-rule="evenodd"
                cx="40"
                cy="24"
                fill-rule="evenodd"
                r="4.5"
              ></circle>
            </svg>
          </div>
        </div>
      </div>
      <div class="body">
        <img
          alt="Photo by Jay Shetty on September 12, 2020. Image may contain: 2 people."
          class="FFVAD"
          decoding="auto"
          sizes="614px"
          src="assets/post.png"
          style="object-fit: cover"
        />
      </div>
      <div class="footer">
        <div class="user-actions">
          <div class="like-comment-share">
            <div>
              <span class=""
                ><svg
                  aria-label="Like"
                  class="_8-yf5"
                  fill="#262626"
                  height="24"
                  viewBox="0 0 48 48"
                  width="24"
                >
                  <path
                    d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"
                  ></path></svg
              ></span>
            </div>
            <div class="margin-left-small">
              <svg
                aria-label="Comment"
                class="_8-yf5"
                fill="#262626"
                height="24"
                viewBox="0 0 48 48"
                width="24"
              >
                <path
                  clip-rule="evenodd"
                  d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </div>
            <div class="margin-left-small">
              <svg
                aria-label="Share Post"
                class="_8-yf5"
                fill="#262626"
                height="24"
                viewBox="0 0 48 48"
                width="24"
              >
                <path
                  d="M47.8 3.8c-.3-.5-.8-.8-1.3-.8h-45C.9 3.1.3 3.5.1 4S0 5.2.4 5.7l15.9 15.6 5.5 22.6c.1.6.6 1 1.2 1.1h.2c.5 0 1-.3 1.3-.7l23.2-39c.4-.4.4-1 .1-1.5zM5.2 6.1h35.5L18 18.7 5.2 6.1zm18.7 33.6l-4.4-18.4L42.4 8.6 23.9 39.7z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="bookmark">
            <div class="QBdPU rrUvL">
              <svg
                aria-label="Save"
                class="_8-yf5"
                fill="#262626"
                height="24"
                viewBox="0 0 48 48"
                width="24"
              >
                <path
                  d="M43.5 48c-.4 0-.8-.2-1.1-.4L24 29 5.6 47.6c-.4.4-1.1.6-1.6.3-.6-.2-1-.8-1-1.4v-45C3 .7 3.7 0 4.5 0h39c.8 0 1.5.7 1.5 1.5v45c0 .6-.4 1.2-.9 1.4-.2.1-.4.1-.6.1zM24 26c.8 0 1.6.3 2.2.9l15.8 16V3H6v39.9l15.8-16c.6-.6 1.4-.9 2.2-.9z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <span class="likes"
          >Liked by <b>ishitaaaa.b</b> and <b>others</b></span
        >
        <span class="caption">
          <span class="caption-username"><b>jayshetty</b></span>
          <span class="caption-text">${post.caption}</span
          >
        </span>
        <span class="comment">
          <span class="caption-username"><b>akhilboddu</b></span>
          <span class="caption-text">Thank you</span>
        </span>
        <span class="comment">
          <span class="caption-username"><b>imharjot</b></span>
          <span class="caption-text"> Great stuff</span>
        </span>
        <span class="posted-time">5 HOURS AGO</span>
      </div>
      <div class="add-comment">
        <input type="text" placeholder="Add a comment..." />
        <a class="post-btn">Post</a>
      </div>
    </div>
      `;
      post.appendChild(postElement);
    });
  }
}

const myApp = new App();
