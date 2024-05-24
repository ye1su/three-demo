import { useEffect, useRef } from 'react'
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Select, Upload } from 'antd';
import { ThreeEngine } from './engine/TEngine';
import styles from './pdb.module.less'
import { PDB_VIZ_TYPE } from './engine/config';
function Pdb() {
  const threeTarget = useRef(null)
  const tEngine = useRef(null)
  useEffect(() => {
    tEngine.current = new ThreeEngine(threeTarget.current)
    tEngine.current.restLoader('/pdb/graphite.pdb')
    return () => {
      tEngine.current.destroy()
    }
  }, [])

  function handleFileDrop(info) {
    const url = URL.createObjectURL(info.file.originFileObj)
    tEngine.current.restLoader(url)
  }
  return (
    <>
      <div className={styles["three-canvas"]} ref={threeTarget} >
        <div className={styles['three-canvas-options']}>
          <Card style={{ width: 300 }}>
            <Upload customRequest={() => null} onChange={handleFileDrop} maxCount={1} showUploadList={false}>
              <Button icon={<UploadOutlined />}>上传PDB</Button>
            </Upload>
            <div>
              <Select
                defaultValue={2}
                style={{ width: 220 }}
                options={PDB_VIZ_TYPE}
                onChange={(value) => {

                  tEngine.current.changeVizType(value)
                }}
              />
            </div>


          </Card>

        </div>
      </div>
    </>
  )
}

export default Pdb
