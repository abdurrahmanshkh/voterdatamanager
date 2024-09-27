<script>
	// Layout Component
	import '../app.css';
	import { Navbar, NavBrand, Footer, FooterCopyright } from 'flowbite-svelte';
	import { Button, Avatar, Modal, FooterLinkGroup } from 'flowbite-svelte';
	import {
		CaretLeftOutline,
		ExclamationCircleOutline,
		UserSettingsOutline
	} from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';

	let popupModal = false;

	function logout() {
		localStorage.removeItem('isAuthenticated'); // Clear localStorage
		localStorage.removeItem('authenticated'); // Clear localStorage
		goto('/'); // Redirect to the homepage
	}

	// Function to navigate to the previous page
	function goBack() {
		window.history.back();
	}
</script>

<header>
	<Navbar class="bg-gray-900 text-white">
		<NavBrand class="text-center" href="/sectors">
			<Avatar class="mr-4 h-12 w-12" />
		</NavBrand>
		<NavBrand class="flex-grow" href="/sectors">
			<span class="mr-2 self-center whitespace-nowrap font-bold md:text-2xl">
				Voter Data Dashboard
			</span>
		</NavBrand>
		<Button on:click={() => goto('/admin')} class="mr-2 bg-blue-300" color="alternative" size="sm">
			<UserSettingsOutline />
		</Button>
		<Button on:click={goBack} class="self-center" color="light" size="xs">
			<CaretLeftOutline />
		</Button>
	</Navbar>
</header>

<main class="min-h-[82vh] bg-gray-100 md:min-h-[80vh]">
	<slot />
</main>

<Footer>
	<div class="flex items-center justify-between bg-gray-900 p-4 text-white">
		<FooterCopyright href="/" />
		<FooterLinkGroup
			ulClass="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 mt-0"
		>
			<Button class="self-center" color="light" size="sm" on:click={() => (popupModal = true)}>
				Logout
			</Button>
		</FooterLinkGroup>
	</div>
</Footer>

<Modal bind:open={popupModal} autoclose>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
		<h3 class="mb-5 text-lg font-normal text-gray-900">Are you sure you want to logout?</h3>
		<Button on:click={logout} color="red" class="me-2">Yes, I'm sure</Button>
		<Button color="alternative">No, cancel</Button>
	</div>
</Modal>
