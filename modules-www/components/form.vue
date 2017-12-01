<template>
    <Placeholder>
        <slot />
    </Placeholder>
</template>

<script>

    export default {
        
        props: {
            'method': String,
            'action': String
        },
        
        mounted() {
            console.log('test form', this.action);
        }
        
    } 
    
</script>