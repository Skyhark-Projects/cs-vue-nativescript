import { mergePost } from '../common/init.js';

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

    handleApiError(form, data)
    {
        /*ar msg = "An error occured while processing your request";
        const err = data.error;

        if(typeof(err) == 'object' || typeof(err) == "array")
        {
            if(typeof(err.error) == 'string')
                msg = err.error;
        }
        else if(typeof(err) == "string")
            msg = err;

        $.notify({ message: msg },{ type: 'danger' });*/
    }

    handleApiSuccess(form, data)
    {
        /*const that= $(form);
        const msg = data.result;

        if(that.attr('SuccessMessage'))
           return $.notify(that.attr('SuccessMessage'), 'success');

        if(typeof(msg) == 'string')
            return $.notify(msg, 'success');

        if(typeof(msg) == 'object')
        {
            if(typeof(msg.result) == 'string')
                return $.notify(msg.result, 'success');
        }

        return $.notify(msg, 'Data successfully updated!');*/
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
        //try
        //{
        //    const secondName = eventName.replace(/-\S*/g, function(txt){ return txt.charAt(1).toUpperCase() + txt.substr(2).toLowerCase();});

            /*if(secondName !== eventName)
            {
                if(!this.trigger(elm, secondName, data))
                    return;
            }

            //------------------------------------------------------------------------

            var event; // The custom event that will be created

            if (document.createEvent) {
                event = document.createEvent("HTMLEvents");
                event.initEvent(eventName, true, true);
            } else {
                event = document.createEventObject();
                event.eventType = eventName;
            }

            event.eventName = eventName;

            for(var key in data)
                event[key] = data[key];

            if (document.createEvent)
                elm.dispatchEvent(event);
            else
                elm.fireEvent("on" + event.eventType, event);

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
                this.events[eventName].call(this, elm, data);
        }
        catch(e)
        {
            console.error(e);
        }

        return true;*/
    }

    handleFormSubmit(elm)
    {
        elm.submit();
    }
}

if(!FormPoster.shared)
    FormPoster.shared = new FormPoster();

export default FormPoster.shared;