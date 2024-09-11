<script>
	// Layout Component
	import '../app.css';
	import { Navbar, NavBrand, Footer, FooterCopyright, Button } from 'flowbite-svelte';
	import { goto } from '$app/navigation';

	function logout() {
		localStorage.removeItem('isAuthenticated'); // Clear localStorage
		goto('/'); // Redirect to the homepage
	}
</script>

<header>
	<Navbar class="bg-primary-300">
		<NavBrand class="text-center" href="/">
			<span class="mr-2 self-center whitespace-nowrap font-bold text-primary-900 md:text-xl">
				Voter's Data -
			</span>
			<span class="self-center whitespace-nowrap font-semibold text-primary-900 md:text-xl">
				Owe, Kharghar
			</span>
		</NavBrand>
		<NavBrand class="">
			<Button color="red" size="sm" on:click={logout}>Logout</Button>
		</NavBrand>
	</Navbar>
</header>

<main class="min-h-[86.5vh] bg-primary-100 md:min-h-[82vh]">
	<slot />
</main>

<footer>
	<Navbar class="bg-primary-300">
		<Footer rounded color="form" class="flex w-full items-center justify-center p-1 text-center">
			<FooterCopyright href="/" by="Voter's Data™" year={2024} />
		</Footer>
	</Navbar>
</footer>
