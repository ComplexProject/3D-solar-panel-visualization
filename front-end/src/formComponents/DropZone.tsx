import { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { IconoirProvider, CloudUpload, SmallLampAlt } from 'iconoir-react';

const focusedStyle: React.CSSProperties = {
  borderColor: '#2196f3'
};

const acceptStyle: React.CSSProperties = {
  borderColor: '#00e676'
};

const rejectStyle: React.CSSProperties = {
  borderColor: '#ff1744'
};

function StyledDropzone() {
  const [file, setFile] = useState<File | undefined>(undefined);

  const saveFile = (file: File) => {
   const fileData = {
    name: file.name,
    type: file.type,
    file: file
   };
   localStorage.setItem("demandProfile", JSON.stringify(fileData));
  };

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    open
  } = useDropzone({
    accept: { 'application/json': [],
              'text/csv': [],
     },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const droppedFile = acceptedFiles[0];
        setFile(droppedFile);
        saveFile(droppedFile);
      }
    }
  });

  const style = useMemo(() => ({
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isFocused,
    isDragAccept,
    isDragReject
  ]);

  return (
  <div className="container">
    <div {...getRootProps({ style })} className='flex flex-col h-[9.2rem] justify-center items-center p-5 border-2 rounded-xl hover:cursor-pointer hover:border-[#006FAA] border-[#808080] border-dashed'>
      <input {...getInputProps()} />
      {!file ? (<>
        <div className="flex-shrink-0">
          <IconoirProvider
            iconProps={{
              color: '#000000',
              strokeWidth: 1.5,
              width: '24px',
              height: '24px',
              style: { flexShrink: 0 }
            }}
          >
            <CloudUpload />
          </IconoirProvider>
        </div>
        <p>Drag & Drop your file</p> 
      </>)
      : (<>
        <div className='flex flex-row items-center w-full justify-center gap-2'>
          <div className="flex-shrink-0">
            <IconoirProvider
              iconProps={{
                color: '#000000',
                strokeWidth: 1.5,
                width: '24px',
                height: '24px',
                style: { flexShrink: 0 }
              }}
            >
              <SmallLampAlt />
            </IconoirProvider>
          </div>
          <p
            className='truncate max-w-[160px]'
            title={file.name}
          >
            {file.name}
          </p>
        </div> 
      </>)
      }
      <p>Or</p>
      <button className='rounded-[10px] bg-[#D9D9D9] h-8 px-3.5 hover:cursor-pointer hover:bg-[#a8a8a8]' type='button'
          onClick= {open}>
        {!file ? "Browse files" : "Choose a different file"}
      </button>
    </div>
  </div>
);
}

export default StyledDropzone