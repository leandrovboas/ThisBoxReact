import React, { Component } from 'react';
import api from '../../services/api';
import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Dropzone from 'react-dropzone';
import socket from 'socket.io-client';

import { MdInsertDriveFile } from 'react-icons/md';
import logo from '../../assets/logo.svg';
import './styles.css';

export default class Box extends Component {
  state = { box: {} }
  
  async componentDidMount(){
    this.subscribeToNewFiles();

    const boxId = this.props.match.params.id;
    const response = await api.get(`boxes/${boxId}`);

    this.setState({ box: response.data });
  }

  handleUpload = (files) => {
      files.forEach(file => {
        const data = new FormData();
        const boxId = this.props.match.params.id;

        data.append('file', file);

        api.post(`boxes/${boxId}/files`, data);
      });
  };

  subscribeToNewFiles = () =>{
    const boxId = this.props.match.params.id;
    const io = socket('https://this-box-node.herokuapp.com/');

    io.emit('connectRoom', boxId);

    io.on('file', data => {
        this.setState({
          box: { ...this.state.box, files: [ data, ...this.state.box.files ] }
        })
    });
  };

  render() {
    return (
      <div id="box-container">
        <header>
          <img src={logo} alt="Logo" />
          <h1>{this.state.box.title}</h1>
        </header>

        <Dropzone onDropAccepted={this.handleUpload}>
          {({getRootProps, getInputProps}) => (
              <div className="upload" {...getRootProps()} >
                <input {...getInputProps()} />
                <p>Arraste um arquivo ou clique aqui</p>
              </div>
          )}
        </Dropzone>

        <ul>
          {this.state.box.files && this.state.box.files.map( file => (
            <li key={file._id}>
              <a className="fileInfo" href={file.url}>
                <MdInsertDriveFile size={24} color="#A5Cfff" />
                <strong>{file.title}</strong>
              </a>
              <span>Há {" "} {
                distanceInWords(file.createdAt, new Date(), 
                { locale: pt}
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
