<!-- src/routes/register/+page.svelte -->
<script>
  import { register, storeToken } from '../lib/auth.js';
  import { goto } from '$app/navigation';

  let email = '';
  let username = '';
  let password = '';
  let errorMessage = '';

  let emailError = '';
  let usernameError = '';
  let passwordError = '';

  function validate() {
    let valid = true;
    emailError = '';
    usernameError = '';
    passwordError = '';

    if (!email) {
      emailError = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      emailError = 'Invalid email format';
      valid = false;
    }

    if (!username) {
      usernameError = 'Username is required';
      valid = false;
    } else if (username.length < 3) {
      usernameError = 'Username must be at least 3 characters';
      valid = false;
    }

    if (!password) {
      passwordError = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      passwordError = 'Password must be at least 6 characters';
      valid = false;
    }

    return valid;
  }

  async function handleSubmit() {
    errorMessage = '';
    if (!validate()) return;

    try {
      const response = await register({ email, username, password });
      storeToken(response.token); // Assumes response has { token }
      goto('/home'); // Redirect to home after success
    } catch (err) {
      errorMessage = err.message || 'Registration failed';
    }
  }
</script>

<div class="container">
  <h1>Register</h1>
  <form on:submit|preventDefault={handleSubmit}>
    <div>
      <label for="email">Email</label>
      <input type="email" id="email" bind:value={email} />
      {#if emailError}<p class="error">{emailError}</p>{/if}
    </div>
    <div>
      <label for="username">Username</label>
      <input type="text" id="username" bind:value={username} />
      {#if usernameError}<p class="error">{usernameError}</p>{/if}
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" bind:value={password} />
      {#if passwordError}<p class="error">{passwordError}</p>{/if}
    </div>
    {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
    <button type="submit">Register</button>
  </form>
</div>

<style>
  .container { max-width: 400px; margin: 0 auto; padding: 20px; }
  .error { color: red; font-size: 0.9em; }
  input { width: 100%; margin-bottom: 10px; }
  button { width: 100%; }
</style>
