import { mergePost } from '../common/init.js';

const dialogs = require("ui/dialogs");

class Event {
    constructor(data) {
        this.cancelable = true;
        this.defaultPrevented = false;

        for (var key in data)
            this[key] = data[key];
    }

    preventDefault()  {
        this.defaultPrevented = true;
    }

    isDefaultPrevented() {
        return this.defaultPrevented;
    }
};

class FormPoster
{
    constructor()
    {
        const _this = this;
        this.events = {
            'api-progress': this.handleApiProgress,
            'api-prepare':  this.handleApiPrepare,
            'api-error':    this.handleApiError,
            'api-success':  this.handleApiSuccess,
            'api-done':     this.handleApiDone
        };
    }

    handleApiError(form, e)
    {
        const result = e.error;
        var msg   = "An error occured while processing your request";

        if(typeof(result) == 'object' || typeof(data) == "array")
        {
            if(typeof(result.error) == 'string')
                msg = result.error;
            if(typeof(result.message) == 'string')
                msg = result.message;
        }
        else if(typeof(result) == "string") {
            msg = data;
        }

        dialogs.alert({
            title: "Error",
            message: msg,
            okButtonText: "Oke"
        });
    }

    handleApiSuccess(form, e)
    {
        const result = e.result;
        var msg      = null;
        
        //if(form.attr('SuccessMessage'))
        //   msg = form.attr('SuccessMessage');

        if(typeof(result) === 'object')
        {
            if(typeof(result.result) === 'string')
                msg = result.result;
            if(typeof(result.message) === 'string')
                msg = result.message;
        }

        if(msg !== null) {
            dialogs.alert({
                message: msg,
                okButtonText: "Done"
            });
        }
    }

    handleApiPrepare(form, data)
    {
        //$(form).find('input, textarea, select, button').not(':disabled').attr('disabled', true).attr('predisabled', true);

        //ToDo: set loader icon
    }

    handleApiProgress(form, data)
    {
        //ToDo set progress in button
    }

    handleApiDone(form)
    {
        //$(form).find('[predisabled]').removeAttr('disabled').removeAttr('predisabled');
    }

    trigger(elm, eventName, data)
    {
        var event;

        try
        {
            const secondName = eventName.replace(/-\S*/g, function(txt){ return txt.charAt(1).toUpperCase() + txt.substr(2).toLowerCase();});

            if(secondName !== eventName)
            {
                event = this.trigger(elm, secondName, data);
                if(!event)
                    return false;
            } else {
                event = new Event({
                    eventName: eventName,
                    type:      eventName,
                    timeStamp: Date.now(),
                    srcElement: elm,
                    target:     elm
                });
            }

            //------------------------------------------------------------------------

            for(var key in data)
                event[key] = data[key];

            elm.$emit(eventName, event);
            
            if(event.defaultPrevented)
                return false;
        }
        catch(e)
        {
            console.error(e);
        }

        try
        {
            if(this.events[eventName])
                this.events[eventName].call(this, elm, event);
        }
        catch(e)
        {
            console.error(e);
        }

        return event;
    }

    handleFormSubmit(elm)
    {
        elm.submit();
    }
}

if(!FormPoster.shared)
    FormPoster.shared = new FormPoster();

export default FormPoster.shared;