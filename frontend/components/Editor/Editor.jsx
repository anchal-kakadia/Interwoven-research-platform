'use client'

import React, {useState, useEffect, useRef} from 'react'

const CkEditor = ({content, handleReviewChange}) => {

    const editorRef = useRef();
    const [isEditorLoaded, setIsEditorLoaded] = useState(false);
    const {CKEditor, Editor} = editorRef.current || {};

    useEffect(()=>{
        editorRef.current = {
            CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
            Editor: require('../ckeditor5/build/ckeditor.js')
        }

        console.log(editorRef)
        setIsEditorLoaded(true)
    },[])

    const editorConfiguration = {list: {
        multiBlock: false, // Turn off the multi block support (enabled by default).
      },
      toolbar: ['heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'blockQuote',
      'undo',
      'redo'],
      label: {
        undo: 'Undo',
        redo: 'Redo',
      },}

    return (<>
        {isEditorLoaded && <CKEditor id={'ck-editor'} editor={Editor} onChange={(event,editor)=>{handleReviewChange(editor.getData())}} config={editorConfiguration} data={content}></CKEditor>}
    </>)
}

export default CkEditor