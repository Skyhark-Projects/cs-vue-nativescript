<template>
    <stack-layout>
        <slot />
    </stack-layout>
</template>

<script>
    const http    = require("http");

    export default {

        props: {
            'method': String,
            'action': String
        },

        methods: {
            trigger(name, data) {
                return this.$api.formPoster.trigger(this, name, data);
            },
            
            submit() {
                this.trigger('api-before-submit', {
                    api: this.action
                });

                //ToDo emit @apiProgress

                const base = this.$api.base();
                const data = this.serialize();

                this.trigger('api-prepare', {
                    api: this.action,
                    data: data
                });

                //-----------------------------------------------------------------------

                http.request({
                    url: base + 'api/' + this.action,
                    method: this.method.toUpperCase(),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    content: JSON.stringify(data)
                }).then((result) => {
                    var content     = result.content;
                    var eventName   = (result.statusCode === 200) ? 'api-success' : 'api-error';
                    
                    if(content.toJSON)
                        content = content.toJSON();

                    const data = {
                        api:        this.action,
                        httpCode:   result.statusCode,
                        result:     content
                    };
                    
                    if(eventName === 'api-error')
                        data.error = content;
                    
                    this.trigger(eventName, data);
                }).catch((err) =>  {
                    this.trigger('apiError', {
                        api:        this.action,
                        httpCode:   result.statusCode,
                        error:      err,
                        result:     err
                    });
                }).catch(function(err) {
                    console.error(err);
                });
            },

            serialize() {
                const data = {};

                function iterateElements($el)  {
                    for (var key in $el.childNodes) {
                        const node = $el.childNodes[key];

                        if (node._tagName === 'textfield') {
                            data[node._nativeView.name] = node._nativeView.text;
                        }

                        iterateElements(node);
                    }
                }

                //Recursively get components & check if $serializeForm is defined
                function iterateComponents(component) {

                    //Serialize component
                    if (component.$serializeForm) {
                        const sub = component.$serializeForm() ||  {};
                        for (var key in sub)
                            data[key] = sub[key];
                    }

                    //Recursively go down
                    component.$children.forEach(iterateComponents);
                }

                iterateElements(this.$el);
                iterateComponents(this);
                return data;
            }
        }

    }

</script>