<template>
  <div class="transact">
    <Head></Head>
    <div id="topNav">
      <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="backToPrvPack">Initialization Page</el-link>
    </div>
    <h3>Welcome to transactions page</h3>
    <el-row>
      <el-col :span="10" :offset="1">
        <div id="leftContainer">
          <h4 id="protocolDataTitle">Protocol data</h4>
          <el-row>
            <el-col :span="23" :offset="1">
              <div class="grid-content bg-purple-dark">
                <el-form
                  :model="receivedTnx"
                  :rules="rules"
                  ref="receivedTnx"
                  :label-position="labelPosition"
                  label-width="110px"
                >
                  <el-col :span="16">
                    <el-form-item label="Received Message" prop="msg">
                      <el-input v-model="receivedTnx.msg" placeholder="Please enter message received."></el-input>
                    </el-form-item>
                    <el-form-item label="Shared secret" prop="sharedsecret">
                      <el-input v-model="receivedTnx.sharedsecret" placeholder="Please enter shared secret."></el-input>
                    </el-form-item>
                    <el-form-item label="Recipient" prop="recipeintAdd">
                      <el-input v-model="receivedTnx.recipeintAdd" placeholder="Please enter recipient's address."></el-input>
                    </el-form-item>
                    <el-form-item>
                    <el-button type="primary" :loading="recipientProcessesLoading" @click="submitForm('receivedTnx')">Receive transaction</el-button>
                      <el-button @click="resetForm('receivedTnx')">Reset</el-button>
                    </el-form-item>
                  </el-col>
                </el-form>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>
      <el-col :span="10" :offset="2">
        <div class="tnxContainers" id="rightContainer">
          <h4>Data recovery</h4>
        </div>
      </el-col>
    </el-row>
    <Footer></Footer>
  </div>
</template>

<script>
// @ is an alias to /src
import Head from '@/components/header'
import Footer from '@/components/Footer'
import { symEncrypt, symDecrypt } from '@/assets/js/symEncryptAndDec'
// import { getters } from '@/store/index'
const Myipfs = new window.Ipfs()

export default {
  // name: 'Home',
  data () {
    return {
      receivedTnx: {
        msg: '',
        sharedsecret: '',
        recipeintAdd: ''
      },
      labelPosition: 'top',
      recipientProcessesLoading: false,
      rules: {
        msg: [
          { required: true, message: 'Please input received message', trigger: 'blur' },
          { min: 2, message: 'Length should be at least 2', trigger: 'blur' }
        ],
        sharedsecret: [
          { required: true, message: 'Please input shared secret', trigger: 'blur' },
          { min: 3, message: 'Length should be at least 3', trigger: 'blur' }
        ],
        recipeintAdd: [
          { required: true, message: 'Address must be in hex and legnth of 5', trigger: 'blur' },
          { min: 5, message: 'Must be in hex and length 5', trigger: 'blur' }
        ]
      }
    }
  },
  components: {
    Head,
    Footer
  },
  methods: {
    submitForm (formName) {
      if (/^0x[0-9A-F]{5}$/i.test(this.receivedTnx.recipeintAdd) === true) {
        this.$refs[formName].validate(valid => {
          this.recipientProcessesLoading = true
          if (valid) {
            console.log('Form validations passed.')
            var data = {
              msg: this.receivedTnx.msg,
              sharedSecret: this.receivedTnx.sharedsecret,
              recipeintAdd: this.receivedTnx.recipeintAdd
            }
            console.log('Received transaction data is: ', data)
            // console.log('Connecting to IPNS using: ', this.$store.state.IPNShash)
            // Get current user IPNS data.
            Myipfs.name.resolve(this.$store.state.IPNShash).then(res => {
              console.log('IPNS Success!')
              console.log('IPFS equivalent hash is: ', res.path)
              // Get the data.
              Myipfs.cat(res.path).then(retrievedData => {
                var encryptedUserMobileData = retrievedData.toString('utf8')
                this.$prompt('Please your decryption key.', 'Information required', {
                  confirmButtonText: 'Continue',
                  cancelButtonText: 'Cancel',
                  inputPlaceholder: 'Enter decryption key.'
                }).then(({ value }) => {
                  symDecrypt(encryptedUserMobileData, value).then(BytesString => {
                    if (Object.keys(BytesString).length !== 0) {
                      console.log('Decryption successful')
                      // Building new object keys.
                      // Original data: {msg:msg, sharedSecret:sharedSecret,counterValue:counterValue,recAdd:recAdd}
                      const countEntries = Object.keys(BytesString).length // Get current number of items.
                      console.log('Original number of entries: ', countEntries)
                      const increasedObjCount = (countEntries / 4) + 1
                      const newMsg = 'msg'
                      const newMsgIndex = newMsg.concat(increasedObjCount)
                      const shSecret = 'sharedSecret'
                      const newshSecret = shSecret.concat(increasedObjCount)
                      const newcounterValue = 'counterValue'
                      const increasedCounterValue = newcounterValue.concat(increasedObjCount)
                      const newRecAdd = 'recAdd'
                      const newRecAddIndex = newRecAdd.concat(increasedObjCount)
                      // Get counter value and increment it.
                      var counters = Object.keys(BytesString).filter(function (k) {
                        return k.indexOf('counterValue') === 0
                      }).reduce(function (pulledCounterData, k) {
                        pulledCounterData[k] = BytesString[k]
                        return pulledCounterData
                      }, {})
                      const countersArray = Object.values(counters)
                      console.log('Counters object: ', countersArray)
                      const counterLength = countersArray.length
                      console.log('Next counter in use: ', counterLength)
                      // Update the object.
                      BytesString[newMsgIndex] = data.msg
                      BytesString[newshSecret] = data.sharedSecret
                      BytesString[increasedCounterValue] = counterLength
                      BytesString[newRecAddIndex] = data.recipeintAdd
                      console.log('Object updated.')
                      console.log('New object is: ', BytesString)
                      // Add to ipfs and publish to IPNS.
                      const msgJSONstr = JSON.stringify({ ...BytesString }) // Without JSON.stringfy, error is thrown at encryption stage.
                      // Encrypt the data to be sent to IPFS.
                      this.$prompt('Please your encryption key.', 'Information required', {
                        confirmButtonText: 'Continue',
                        cancelButtonText: 'Cancel',
                        inputPlaceholder: 'Enter your encryption key.'
                      }).then(({ value }) => {
                        symEncrypt(msgJSONstr, value).then(encryptedData => {
                          console.log('Encryption done.')
                          // Push to IPFS.
                          this.pushToIPFShub(encryptedData)
                        })
                      })
                    } else {
                      console.log('Error!')
                      this.recipientProcessesLoading = false
                      this.$message.error('Sorry! No data found.')
                    }
                  }).catch((error) => {
                    this.recipientProcessesLoading = false
                    this.$message.error('Error encrypting data. Please, try again..')
                    console.log('Error with encryption:', error)
                  }
                  )
                })
              })
            })
            // Data encryption
            // Upload to IPNS
            this.recipientProcessesLoading = false
          } else {
            console.log('Submission error.')
            this.recipientProcessesLoading = false
            return false
          }
        })
      } else {
        this.recipientProcessesLoading = false
        this.$message('Invalid address format. Please, reenter.')
      }
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
        this.$alert('IPFS object updated successfully. Your IPNS address is ' + ipnsHash, 'Notice on encryption and storage.', {
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
        // this.pgReload()
      }).catch((err) => {
        console.log('IPNS error.', err)
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    backToPrvPack () {
      this.$router.push('/')
    },
    pgReload () {
      window.location.reload()
    }
  }
}
</script>

<style scoped>
#protocolDataTitle {
  text-align: left;
}
#leftContainer{
  width: 40rem;
  height: 25rem;
}

#rightContainer{
  width: 40rem;
  height: 32rem;
 border-width: 2px 2px;
  border-color: rgb(155, 97, 108);
  border-radius: 1%;
  background-color:rgb(221, 231, 243);
}
</style>
