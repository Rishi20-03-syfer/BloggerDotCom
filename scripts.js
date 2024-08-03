document.addEventListener('DOMContentLoaded', () => {
    // Form validation
    const loginForm = document.querySelector('form[action="/login"]');
    const registerForm = document.querySelector('form[action="/register"]');
    const contactForm = document.querySelector('.contact-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (validateLoginForm()) {
                // If validation passes, you would typically send the data to your server here
                console.log('Login form submitted');
                if (await loginUser(document.getElementById('username').value, document.getElementById('password').value)) {
                    window.location.href = 'index.html';  // Redirect to home page after successful login
                } else {
                    alert('Login failed. Please try again.');
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (validateRegisterForm()) {
                // If validation passes, you would typically send the data to your server here
                console.log('Registration form submitted');
                const username = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirm-password').value;

                if (password !== confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }

                if (await registerUser(username, email, password)) {
                    window.location.href = 'index.html';  // Redirect to home page after successful registration
                } else {
                    alert('Registration failed. Please try again.');
                }
            }
        });
    }

    // Search functionality
    const searchForm = document.querySelector('.search form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchForm.querySelector('input[type="text"]').value;
            console.log(`Searching for: ${searchTerm}`);
            // Here you would typically send the search request to your server
            // and update the page with the results
        });
    }

    // Mobile menu toggle
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const menuToggle = document.createElement('button');
        menuToggle.textContent = '☰';
        menuToggle.className = 'menu-toggle';
        document.querySelector('nav').prepend(menuToggle);

        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name')?.value;
            const email = document.getElementById('email')?.value;
            const message = document.getElementById('message')?.value;

            if (name.trim() === '' || email.trim() === '' || message.trim() === '') {
                alert('Please fill in all fields');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, message }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Thank you for your message. We will get back to you soon!');
                    contactForm.reset();
                } else {
                    alert(`Error: ${data.msg || 'Failed to send message'}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    }

    // Fetch and display posts on the home page
    if (window.location.pathname.endsWith('index.html')) {
        displayPosts();
    }

    // Handle create post form submission
    const createPostForm = document.getElementById('create-post-form');
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;

            const newPost = await createPost(title, content);
            if (newPost) {
                alert('Post created successfully!');
                window.location.href = 'index.html';  // Redirect to home page after creating post
            } else {
                alert('Failed to create post. Please try again.');
            }
        });
    }
});

// Validation functions
function validateLoginForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username.trim() === '' || password.trim() === '') {
        alert('Please enter both username and password');
        return false;
    }
    return true;
}

function validateRegisterForm() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (username.trim() === '' || email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
        alert('Please fill in all fields');
        return false;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }

    return true;
}

const API_URL = 'http://127.0.0.1:5000';

async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            return true;
        } else {
            throw new Error(data.msg || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

async function registerUser(username, email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            return true;
        } else {
            throw new Error(data.msg || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        return false;
    }
}

async function createPost(title, content) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.msg || 'Failed to create post');
        }
    } catch (error) {
        console.error('Create post error:', error);
        return null;
    }
}

async function getPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error('Failed to fetch posts');
        }
    } catch (error) {
        console.error('Get posts error:', error);
        return [];
    }
}

// Fetch and display posts on the home page
async function displayPosts() {
    const posts = await getPosts();
    const postsContainer = document.querySelector('.post-grid');
    if (postsContainer) {
        postsContainer.innerHTML = '';  // Clear existing posts
        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'post-card';
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 100)}...</p>
                <a href="post.html?id=${post.id}" class="read-more">Read More</a>
            `;
            postsContainer.appendChild(postElement);
        });
    }
}
