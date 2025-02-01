import './App.css'
import TableVisualization from './Components/TableVisualization'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <>
      <Toaster position="top-right" />
      <TableVisualization />
    </>
  )
}

export default App
