<!-- src/routes/login/+page.svelte -->
<script>
  import { login, storeToken } from '$lib/auth.js';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMessage = '';

  let emailError = '';
  let passwordError = '';

  function validate() {
    let valid = true;
    emailError = '';
    passwordError = '';

    if (!email) {
      emailError = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      emailError = 'Invalid email format';
      valid = false;
    }

    if (!password) {
      passwordError = 'Password is required';
      valid = false;
    }

    return valid;
  }

  async function handleSubmit() {
    errorMessage = '';
    if (!validate()) return;

    try {
      const response = await login({ email, password }); // Assumes login with email/password; adjust if username
      storeToken(response.token); // Assumes response has { token }
      goto('/home'); // Redirect to home after success
    } catch (err) {
      errorMessage = err.message || 'Login failed';
    }
  }
</script>

<div class="container">
  <h1>Login</h1>
  <form on:submit|preventDefault={handleSubmit}>
    <div>
      <label for="email">Email</label>
      <input type="email" id="email" bind:value={email} />
      {#if emailError}<p class="error">{emailError}</p>{/if}
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" bind:value={password} />
      {#if passwordError}<p class="error">{passwordError}</p>{/if}
    </div>
    {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
    <button type="submit">Login</button>
  </form>
</div>

<style>
  .container { max-width: 400px; margin: 0 auto; padding: 20px; }
  .error { color: red; font-size: 0.9em; }
  input { width: 100%; margin-bottom: 10px; }
  button { width: 100%; }
</style>
