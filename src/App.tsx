

//react
import { useState, useEffect} from 'react';
//font-awsome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { faFolderTree } from '@fortawesome/free-solid-svg-icons';
// bootstrap
import { ProgressBar } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';
import { Container, Button } from 'react-bootstrap';

//tauri
// import { open } from '@tauri-apps/api/dialog';
// import { appDataDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api';


import ToggleSwitch from './components/toggleSwitch';
// busines logic funcctions
import { folderSelector, folderIterator, handleCuration, handleCopy } from './businessLogic';


const sourceDirIcon = <FontAwesomeIcon icon={faFolder}/>;
const destDirIcon  = <FontAwesomeIcon icon={faFolderTree}/>

const buttonStyle = {
    width: "10rem"
  };

function App() {
  //  const inputRef = useRef<HTMLInputElement | null>(null)
  const [sourceColor, setSourceColor] = useState({'color': 'red'});
  const [destColor, setDestColor] = useState({'color': 'red'})
  const [sourceFolder, setSourceFolder] = useState('');
  const [destFolder, setDestFolder] = useState('');
  const [sourceContent, setSourceContent] = useState(['']);
  const [numberOfItems, setNumberOfItems] = useState(0)
  const [startDisabled, setStartDisabled] = useState(true)
  const [polarity, setPolarity] = useState('pos');
  const [currentFolderNum, setCurrentFolderNum] = useState(0);
  const [progress, setProgress] = useState('0');
  // const [processStatus, setProcessStatus] = useState('');
  // const [processLog, setProcessLog] = useState('');
  const [tableData, setTableData] = useState([])
  
  const handleUploadClick = (func:any) => {
      folderSelector().then((data) => {
	func(data)});
  }

  // checks for input folder and sets it 
  useEffect(
    () => {
      invoke('read_directory', {'basepath': sourceFolder }).then(
	(data) => {
	  setSourceContent(data);
	  setNumberOfItems(data.length);
	}
      ).catch((_error) => {} )
    }, [sourceFolder], )
  
  // updates progress bar data
  useEffect(
    () => {
      let _progress: number = 0;
      if (numberOfItems !== 0){
	_progress = currentFolderNum / numberOfItems * 100;
	setProgress(_progress.toFixed(0));
      } else {
	setProgress('0');
      }
	
    }, [currentFolderNum],)
  
  // ensures correct setting  of source folder 
  useEffect(
    () => {
      if (sourceContent.length > 2){
	setSourceColor({'color': 'green'})
      }
    }, [sourceContent],
  )

  // ensures correct setting of destination folder
  useEffect(
    () => {
      if (destFolder !== '')
	if (destFolder.includes('Production')){
	  setDestColor({'color': 'green'})
	} else {
	  setDestColor({'color': 'orange'})
	}
    }, [destFolder],
  )

  
  //enables "start Process" button if paths differ
  useEffect(
    () => {
      if ((sourceFolder === destFolder) || (sourceFolder === '') || (destFolder === '')){
	setStartDisabled(true);
      } else if ((sourceFolder === '') || (destFolder === '')){
	setStartDisabled(true)
      } else {
	setStartDisabled(false)
      }
	 }, [sourceFolder, destFolder],
  )

  // generator object over list of folders
  let folders = folderIterator(setCurrentFolderNum, sourceContent)

  // proxy to handle main business logic
  const handleFolders = async (folders) => {
    for (const [path, compound_id] of folders){
      try {
	const [status, log] = await handleCuration(path, polarity, compound_id);
	// console.log(status, log)
	let processLog = log;
	let processStatus = status;

	if (status === 'OK') {
          const [statusc, logc] = await handleCopy(path, destFolder, compound_id);
        // console.log(statusc, logc)
          let processStatus = statusc;

          if (statusc === 'Error') {
          let processLog = logc;
        }
      }
      // console.log(processStatus, processLog)
      let tableItem = { 'folderName': compound_id,
			  'statusCode': processStatus,
			  'errorCode': processLog };
      
	setTableData((tableData) =>  [...tableData, tableItem]);
      } catch (error) {
	console.error('An error occurred:', error);
      }
    }
  };

  
  return (
    <>
      <Container>
      <div className='row mt-5'>
      <InputGroup>
      <Button
        className='btn btn-primary'
        style={buttonStyle}
        onClick={() => {
              handleUploadClick(setSourceFolder)}}
      >Source Folder</Button>
      <InputGroup.Text style={sourceColor}>{sourceDirIcon}</InputGroup.Text>
      <Form.Control type="text" placeholder='please select folder with button' value={sourceFolder} disabled/>
      </InputGroup>
      <InputGroup>
      <Button className='btn btn-primary' style={buttonStyle}
        onClick = {() => handleUploadClick(setDestFolder)}
      >Destination Folder</Button>
      <InputGroup.Text style={destColor}>{destDirIcon}</InputGroup.Text>
      <Form.Control type="text" placeholder='please select folder with button' value={destFolder} disabled/>
      </InputGroup>
      </div>
      <div className='row mt-5'>   
      <div className='d-flex p-3'>
      <h4 className='px-3'>Polarity:</h4>
      <ToggleSwitch func={setPolarity}/>
      </div>
      <div>
      <Button className='btn btn-success' onClick={()=> handleFolders(folders)}  disabled={startDisabled}>Start Process</Button>
      <ProgressBar now={progress} label={progress} className='mt-2'/>
      </div>
      </div>
      <div className='row mt-5'>
      <Table>
      <thead>
      <tr>
      <th>Compound ID</th>
      <th>Status</th>
      <th>Messages</th>
      </tr>
      </thead>
      <tbody>
      {tableData.map((item) => { return ( 
	<tr>
	  <td>{item.folderName}</td>
	  <td>{item.statusCode}</td>
	  <td>{item.errorCode}</td>
	</tr>
      )})
      }	     
      </tbody>
      </Table>
      </div>
      </Container>
    </>
  );
}

export default App;
