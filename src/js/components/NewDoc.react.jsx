import React from 'react';
import { Navigation } from 'react-router';
import TagInput from './editor/taginput.react';
import Editor from './editor/editor.react';
import TitleInput from './editor/title.react';
import ButtonGroup from './editor/buttongroup.react';
import { isEmptyString, isDefined, isString, ajax } from '../util';
import Modal, {showModal} from './modal/modal.react';
import Constant from '../constant';

export default React.createClass({
  mixins: [Navigation],
  statics: {
    willTransitionFrom (transition, component, callback) {
      if(/\/doc\/\w+/.test(transition.path)) callback();
      else {
        let content = (<div>Cancel editing?</div>);
        showModal(content, {
          width: 400,
          type: 'confirm',
          onClose (ret) {
            if(ret) {
              component.refs.editor.discard();
            }
            else transition.abort();

            // ensure to call it once
            callback();
          }
        });
      }
    }
  },
  getInitialState () {
    return {
      title: '',
      tags: [],
      content: '',
      attachments: [],
      message: '',
      validation: {
        title: true,
        content: true
      }
    }
  },
  render () {
    return (
      <div id="editor">
        <form>
          <h2 className="icon-text"><i className="fa fa-file-text-o"></i> Write Document</h2>
          <TitleInput title={this.state.title} refreshState={this._refreshState('title')} validate={this.state.validation.title} />
          <TagInput tags={this.state.tags} refreshState={this._refreshState('tags')} />
          <Editor ref="editor" content={this.state.content} refreshState={this._refreshState('content')} validate={this.state.validation.content}
            fileUploadUrl={Constant.FILEUPLOADURL} refreshAttachment={this._refreshState('attachments')} />
          <ButtonGroup submit={this._submit} message={this.state.message} />
        </form>
      </div>
    );
  },
  // recieve an article id
  _afterPost (id) {
    if(id) this.transitionTo('doc', {id: id});
  },
  _submit (e) {
    e.preventDefault();
    // ensure validate
    let validation = this.state.validation;
    for(let key in validation) if(validation.hasOwnProperty(key)) {
      if(!this._checkValidate(key, this.state[key])) return;
    }

    if(this.refs.editor.checkRequesting()) { // show modal
      let content = (<div>There are still some files are uploading, abort them?</div>);
      showModal(content, {
        type: 'confirm',
        width: 400,
        onClose: (ret) => {
          if(ret) {
            this.refs.editor.abort();
            this._post();
          }
          // do nothing if canceled
        }
      });
    }
    else { // do submitting
      this._post();
    }
  },
  _post () {
    ajax.post(Constant.ARTICLEURL, this.state)
      .then((res) => {
        let id = res[0]._id;
        // redirect
        this._afterPost(id);
      })
      .catch((xhr) => {
        if(xhr.hasTimeout) {
          this._setErrMsg('Request timeout.');
        }
        else {
          let res, msg;
          if(xhr.status == 0) {
            msg = 'Can\'t connect to server.';
          }
          else {
            try {
              res = JSON.parse(xhr.response);
              msg = res.msg || 'Unexpected error.';
            }
            catch(e) {
              msg = 'Unknown response.';
            }
          }

          this._setErrMsg(msg);
        }
      });
  },
  _refreshState (key) {
    return (val) => {
      let temp = {};
      temp[key] = val;
      this.setState(temp);

      // check validate
      this._checkValidate(key, val);
    };
  },
  _checkValidate (key, val) {
    let msg = '', flag = true;
    if(isDefined(this.state.validation[key]) && isEmptyString(val)) {
      if(key == 'title') msg = 'Title should be populated.';
      else if(key == 'content') msg = 'Content should be populated.';

      flag = false;
    }

    this._setErrMsg(msg);

    return flag;
  },
  _setErrMsg (msg) {
    this.setState({message: msg});
  }
});
