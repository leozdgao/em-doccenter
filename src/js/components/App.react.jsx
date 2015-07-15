import React from 'react';
import {RouteHandler} from 'react-router';
import PageHeaderStore from '../stores/pageheaderStore';
import PageHeader from './scaffold/pageheader.react';
import Sidebar from './scaffold/sidebar.react';

export default React.createClass({
  componentDidMount () {
    // listen to store and change page header
    PageHeaderStore.listen((ret) => {
      this.setState(ret);
    });
  },
  render () {
    return (
      <div>
        {/*side bar here*/}
        <Sidebar />
        {/*content*/}
        <div className="page-wrapper">
          <PageHeader show={this.state.show} title={this.state.title} breadcrumbs={this.state.breadcrumbs} />
          <RouteHandler />
        </div>
      </div>
    );
  }
});
