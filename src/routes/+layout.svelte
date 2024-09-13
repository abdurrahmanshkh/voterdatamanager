<script>
	// Layout Component
	import '../app.css';
	import { Navbar, NavBrand, Footer, FooterCopyright, Button, Avatar } from 'flowbite-svelte';
	import { goto } from '$app/navigation';

	function logout() {
		localStorage.removeItem('isAuthenticated'); // Clear localStorage
		goto('/'); // Redirect to the homepage
	}
</script>

<header>
	<Navbar class="bg-gray-900 text-white">
		<NavBrand class="text-center" href="/sectors">
			<Avatar src="/favicon.png" class="mr-4 h-12 w-12" />
		</NavBrand>
		<NavBrand class="flex-grow" href="/sectors">
			<span class="mr-2 self-center whitespace-nowrap text-xl font-bold md:text-2xl">
				Sajid Patel
			</span>
		</NavBrand>
		<Button class="self-center" color="light" size="sm" on:click={logout}>Logout</Button>
	</Navbar>
</header>

<main class="min-h-[84vh] bg-gray-100 md:min-h-[80vh]">
	<slot />
</main>

<footer>
	<Navbar class="bg-gray-900 text-white">
		<Footer rounded color="form" class="flex w-full items-center justify-center p-2 text-center">
			<FooterCopyright href="/" by="Voter's Data™" year={2024} />
		</Footer>
	</Navbar>
</footer>
