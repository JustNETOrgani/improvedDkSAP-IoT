<template>
  <div class="home">
    <div id="myWrapper">
      <div id="homePage">
        <el-row>
            <el-col :span="22" :offset="1">
              <h4>Encryption and decentralized storage-based DkSAP-IoT</h4>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="14" :offset="4">
              <p>Click button below to start</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="14" :offset="5">
              <el-button :loading="loadingData" icon="el-icon-switch-button" id="btnInit" type="primary" round @click="protocolInit()">Initialize Protocol</el-button>
            </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { symEncrypt } from '@/assets/js/symEncryptAndDec'
const Myipfs = new window.Ipfs()

export default {
  // name: 'Home',
  data () {
    return {
      loadingData: false
    }
  },
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
      this.loadingData = true
      var msg = ''
      var sharedSecret = 0
      var counterValue = 0
      var senderAdd = ''
      var expDestKeyPair = []
      // Prepare data to be in Object format.
      const senderObj = {
        msg1: msg,
        sharedSecret1: sharedSecret,
        counterValue1: counterValue,
        senderAdd1: senderAdd,
        expDestKeyPair1: expDestKeyPair
      }
      // Data encryption begins.
      const msgJSONstr = { ...senderObj }
      console.log('Object to be stored on IPFS: ', msgJSONstr)
      this.$prompt('Please enter your encryption key.', 'Information required', {
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        inputPlaceholder: 'Enter your encryption key.',
        inputType: 'password'
      }).then(({ value }) => {
        const firstEnteredKeyValue = value
        this.$prompt('Please reenter your encryption key to confirm.', 'Key Confirmation required', {
          confirmButtonText: 'Continue',
          cancelButtonText: 'Cancel',
          inputPlaceholder: 'Enter your encryption key.',
          inputType: 'password'
        }).then(({ value }) => {
          if (firstEnteredKeyValue === value) {
            symEncrypt(msgJSONstr, value).then(encryptedData => {
              console.log('Encryption done.')
              this.pushToIPFShub(encryptedData)
            }).catch((error) => {
              this.loadingData = false
              this.$message.error('Error encrypting data. Please, try again..')
              console.log('Error with encryption:', error)
            }
            )
          } else {
            this.loadingData = false
            this.$message({
              showClose: true,
              message: 'Sorry! Confirmation key mismatch.',
              type: 'warning'
            })
          }
        }).catch(err => {
          console.log('Cancelled by user', err)
          this.loadingData = false
          this.$message.error('Confirmation of encryption key is required.')
        })
      }).catch(err => {
        console.log('Cancelled by user', err)
        this.loadingData = false
        this.$message.error('Encryption key is required.')
      })
    },
    pushToIPFShub (encryptedData) {
      console.log('Connecting to IPFS.')
      const MyBuffer = window.Ipfs.Buffer
      var dataToBuffer = MyBuffer.from(encryptedData)
      Myipfs.add(dataToBuffer).then(res => {
        console.log('Data upload to IPFS sucessful')
        this.loadingData = false
        console.log('IPFS hash is: ', res[0].hash)
        this.publishToIPNS(res[0].hash)
      }).catch(err => {
        console.log('Error pushing data to IPFS', err)
        this.loadingData = false
        this.$message.error('Error pushing data to IPFS.')
      })
    },
    publishToIPNS (returnedHash) {
      console.log('Connecting to IPNS')
      Myipfs.name.publish(returnedHash).then(res => {
        console.log('IPNS Success!')
        const ipnsHash = res.name
        console.log('IPNS address is:', ipnsHash)
        this.loadingData = false
        this.$alert('Successful initialization. Your IPNS address is ' + ipnsHash, 'State of protocol initialization.', {
          confirmButtonText: 'OK',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${action}`
            })
          }
        })
        // Push IPNS to store.
        this.$store.state.IPNShash = ipnsHash
        // change route to transactions page.
        this.$router.push('/transactions')
      }).catch((err) => {
        console.log('IPNS error.', err)
        this.loadingData = false
        this.$message.error('Error publishing data to IPNS.')
      })
    }
  }
}
</script>

<style scoped>
#myWrapper{
  margin-top: 5%;
  margin-bottom: 5%;
  margin-left: 28%;
  width: 40rem;
  position: absolute;
  height: 35rem;
  border-width: 2px 2px;
  border-color: rgb(155, 97, 108);
  border-radius: 50%;
  background-color:rgb(191, 205, 219);
}

#homePage{
  margin: 25% auto;
  width: 32rem;
  height: 13rem;
  border-width: 2px 2px;
  border-color: rgb(155, 97, 108);
  border-radius: 8%;
  background-color:rgb(214, 226, 240);
}

#btnInit{
  margin-top: 1.5rem;
}
</style>
