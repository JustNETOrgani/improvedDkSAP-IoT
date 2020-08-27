<template>
  <div class="home">
    <div id="homePage">
      <el-row>
          <el-col :span="22" :offset="1">
            <p>Encryption and decentralized storage-based DkSAP-IoT</p>
          </el-col>
      </el-row>
      <el-row>
          <el-col :span="14" :offset="4">
            <p>Click button below to start</p>
          </el-col>
      </el-row>
      <el-row>
          <el-col :span="14" :offset="5">
            <el-button id="btnInit" type="primary" round @click="protocolInit()">Initialize Protocol</el-button>
          </el-col>
      </el-row>
    </div>
    <div id="footerDiv">
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import Head from '@/components/header'
// import Footer from '@/components/Footer'
import { symEncrypt } from '@/assets/js/symEncryptAndDec'
const Myipfs = new window.Ipfs()

export default {
  // name: 'Home',
  components: {
    // Footer
  },
  methods: {
    submitForm (formName) {
      if (this.userAccountIndexEntered.length !== 0) {
        this.$refs[formName].validate(valid => {
          if (valid) {
          }
        })
      }
    },
    protocolInit () {
      var msg = ''
      var sharedSecret = 0
      var counterValue = 0
      var recAdd = ''
      // Prepare data to be in Object format.
      const senderObj = { msg1: msg, sharedSecret1: sharedSecret, counterValue1: counterValue, recAdd1: recAdd }
      // Data encryption begins.
      const msgJSONstr = JSON.stringify({ ...senderObj }) // Without JSON.stringfy, error is thrown at encryption stage.
      console.log('Object to be stored on IPFS: ', msgJSONstr)
      // var key = prompt('Please enter Data Encryption key. Keep it safe.')
      // var encryptedMsg = symEncrypt(msgJSONstr, key).toString()
      this.$prompt('Please your encryption key.', 'Information required', {
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        inputPlaceholder: 'Enter your encryption key.'
      }).then(({ value }) => {
        symEncrypt(msgJSONstr, value).then(encryptedData => {
          console.log('Encryption done.')
          // console.log('Encrypted manuscript data is: ', encryptedData)
          this.pushToIPFShub(encryptedData)
        }).catch((error) => {
          this.loadingData = false
          this.$message.error('Error encrypting data. Please, try again..')
          console.log('Error with encryption:', error)
        }
        )
      })
      // console.log('Encrypted Public Key data: ', encryptedMsg)
      // Data encryption ends here.
      // Send to IPFS.
      // const ipfs      = window.IpfsHttpClient('/ip4/127.0.0.1/tcp/5001')
    },
    pushToIPFShub (encryptedData) {
      // var encryptedDataToSendToJviaIPFS = JSON.stringify({ encryptedData })
      console.log('Connecting to IPFS.')
      const MyBuffer = window.Ipfs.Buffer
      var dataToBuffer = MyBuffer.from(encryptedData)
      Myipfs.add(dataToBuffer).then(res => {
        console.log('Data upload to IPFS sucessful')
        this.loadingData = false
        // this.$message('File upload success.')
        // this.IPFSHashOfFinalPaper = res[0].hash
        console.log('IPFS hash is: ', res[0].hash)
        this.publishToIPNS(res[0].hash)
      })
    },
    publishToIPNS (returnedHash) {
      console.log('Connecting to IPNS')
      Myipfs.name.publish(returnedHash).then(res => {
        console.log('IPNS Success!')
        const ipnsHash = res.name // This should be same as Peer ID. All users must point to this.
        console.log('IPNS address is:', ipnsHash)
        this.$alert('Successful initialization. Your IPNS address is ' + ipnsHash, 'State of protocol initialization.', {
          confirmButtonText: 'OK',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${action}`
            })
          }
        })
        // change route to transactions page.
        this.$router.push('/transactions')
      }).catch((err) => {
        console.log('IPNS error.', err)
      })
    }
  }
}
</script>

<style scoped>
#homePage{
  margin: 20% auto;
  width: 30rem;
  height: 13rem;
  border-width: 2px 2px;
  border-color: rgb(155, 97, 108);
  border-radius: 1%;
  background-color:rgb(162, 183, 207);
}

#btnInit{
  margin-top: 1.5rem;
}
</style>
