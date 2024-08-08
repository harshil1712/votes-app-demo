<script>
    import {onMount} from 'svelte'

    /**
   * @type {{ yes: number; no: number; }}
   */
    let userVotes = {yes: 0, no: 0};
    /**
   * @type {WebSocket}
   */
    let ws;
    onMount(()=> {
        ws = new WebSocket('ws://localhost:8787');

        ws.onmessage = async (e) => {
            let {votes} = await JSON.parse(e.data)
            userVotes = votes
            console.log(userVotes)
        }

        ws.onopen = (e) => {
            ws.send('')
            console.log('WebSocket Connection Open')
        }

        ws.onclose = () => {
            console.log('WebSocket Connection Close')
        }
    });

    function handleForm(e) {
        let vote = e.submitter.value;
        ws.send(vote)
    }

</script>

<svelte:head>
    <title>Durable Object</title>
    <meta name="description" content="A live poll/voting app demo built with SvelteKit and Cloudflare's Durable Object" />
</svelte:head>

<main class="container">
<h1>Have you tried Durable Objects, yet?</h1>
    <form on:submit|preventDefault={handleForm} class="formContainer">
        <div>
            <p class="votes">{userVotes?.yes}</p>
            <button value="1" name="vote" type="submit" class="votesButton">Yes</button>
        </div>
        <div>
            <p class="votes">{userVotes?.no}</p>
            <button value="0" name="vote" type="submit" class="votesButton">No</button>
        </div>
    </form>
</main>

<style>
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 95vh;
        font-family: 'Courier New', Courier, monospace;
    }
    .formContainer {
        display: flex;
        justify-content: space-around;
        width: 30vw;
    }
    .votes {
        font-size: 4em;
        text-align: center;
    }
    .votesButton {
        font-size: 2em;
        text-align: center;
        padding: 1em 2em;
        border: none;
        cursor: pointer;
    }
    .votesButton:active {
        box-shadow: 2px 2px 3px rgb(215, 215, 215);
    }
</style>
