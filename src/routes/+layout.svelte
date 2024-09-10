<script>
	import '../app.css';
	import { Navbar, NavBrand, Footer, FooterCopyright, Button } from 'flowbite-svelte';
	import { goto } from '$app/navigation';

	function logout() {
		localStorage.removeItem('isAuthenticated'); // Clear localStorage
		goto('/'); // Redirect to the homepage
	}
</script>

<header class="border-2">
	<Navbar>
		<NavBrand href="/">
			<span class="mr-2 self-center whitespace-nowrap text-xl font-bold text-primary-800">
				Voter's Data -
			</span>
			<span class="self-center whitespace-nowrap text-xl font-semibold text-primary-800">
				Owe, Kharghar
			</span>
		</NavBrand>
		<div class="flex items-center justify-end">
			<Button on:click={logout}>Logout</Button>
		</div>
	</Navbar>
</header>

<main style="min-height: 81.5vh;">
	<slot />
</main>

<footer class="border-2">
	<Navbar>
		<Footer rounded color="form" class="flex w-full items-center justify-center text-center">
			<FooterCopyright href="/" by="Voter's Data™" year={2024} />
		</Footer>
	</Navbar>
</footer>
