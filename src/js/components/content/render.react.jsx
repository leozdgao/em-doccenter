import React from 'react';
import {Link, Navigation} from 'react-router';
import Modal, {showModal} from '../modal/modal.react';
import IconText from '../toolkit/icontext.react';
import {ajax, dateFormat, AutoIndexer} from '../../util';
import Constant from '../../constant';

let container;

export default React.createClass({
  mixins: [Navigation],
  getDefaultProps () {
    return {
      article: {},
      content: ''
    };
  },
  componentDidMount () {
    setTimeout(() => {
      let article = React.findDOMNode(this.refs.article);
      article.innerHTML = this.props.content;
      let indexer = AutoIndexer.createIndexer();
      let index = indexer(article);
      this.props.onIndexed(index);
    }, 1000);
  },
  render () {
    let article = this.props.article;
    let tags = article.tags.map((t, i) => {
      return (
        <span key={i} className="tag">{t}</span>
      );
    }), atts = (article.attachments || []).map((t, i) => {
      return (
        <a key={i} className="att" href={Constant.FILEUPLOADURL + t.key} title={t.name} target="_self">{t.name}</a>
      );
    });

    return (
      <div className="render">
        <div className="header">
          <h1>{article.title}</h1>
          {article.tags.length > 0 ? (
            <div className="tags">
              <IconText className="icon-text" iconClassName="fa fa-tags">{tags}</IconText>
            </div>
          ): null}
          <div className="hfooter">
            <div className="hinfo">
              <span className="help-text">CreatedBy: {article.author || '?'}</span>
              <span className="help-text">CreatedDate: {dateFormat(article.date)}</span>
              <span className="help-text">LastUpdateDate: {dateFormat(article.lastUpdateDate)}</span>
              <Link to="edit" params={{id: article._id}} title="Edit"><i className="help-text fa fa-pencil fun"></i></Link>
              <a className="help-text" onClick={this._onRemove} title="Remove"><i className="fa fa-trash-o fun"></i></a>
            </div>
            {(article.attachments || []).length > 0 ? (
              <div className="hatts">
                <IconText className="icon-text" iconClassName="fa fa-paperclip">{atts}</IconText>
              </div>
            ): null}
          </div>
        </div>
        <div ref="article" className="markdown"></div>
        {/*<CommentBox />*/}
      </div>
    );
  },
  _onRemove () {
    // prepare container for modal
    if(!container) {
      container = document.createElement('div');
      document.body.appendChild(container);
    }

    let content = (
      <div>Remove this article ?</div>
    ), self = this;

    this.d = showModal(content, {
      type: 'confirm',
      width: 400,
      onConfirm: () => {
        return ajax.delete('/service/article/' + this.props.article._id);
      },
      onClose: (redirect) => {
        if(redirect) {
          self.transitionTo('docs');
        }
      }
    }, container);
  }
  // consider some iframe service like jsfiddle
});
