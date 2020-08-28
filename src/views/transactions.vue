<template>
  <div class="transact">
    <Head></Head>
    <div id="topNav">
      <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="backToPrvPack">Initialization Page</el-link>
    </div>
    <el-row>
      <el-col :span="21" :offset="1">
        <h3>Transactions page</h3>
      </el-col>
    </el-row>
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
                    <el-form-item label="Transaction data or Coin" prop="msg">
                      <el-input v-model="receivedTnx.msg" placeholder="Please enter transaction data or coin received."></el-input>
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
          <el-row>
            <el-col :span="5" :offset="6">
              <h3>Data recovery</h3>
            </el-col>
            <el-col :span="6" :offset="2">
              <el-button id="btnGetData" type="primary" plain icon="el-icon-download" :loading="getUserDataLoading" @click="getUserData()">Get data</el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="21" :offset="1">
              <div v-if="encryptedData" v-loading="encryptedDataLoading">
                <el-table
                  :data="tableData"
                  style="width: 100%"
                  height="200px">
                  <!--Building table body-->
                  <template v-for="(item, index) in encryptedDataTableLabel">
                    <el-table-column
                      :key="index"
                      :prop="item.prop"
                      :label="item.label" :width="item.width">
                    </el-table-column>
                  </template>
                </el-table>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="21" :offset="1">
              <div id="decryptedTableDiv" v-if="decryptedData" v-loading="decryptedDataLoading">
                  <el-table
                  :data="pageTableData"
                  style="width: 100%"
                  height="200px"
                  >
                  <!--Building table body-->
                  <template v-for="(item, index) in decryptedDataTableLabel">
                    <el-table-column
                      :key="index"
                      :prop="item.prop"
                      :label="item.label" :width="item.width">
                    </el-table-column>
                  </template>
                </el-table>
              </div>
            </el-col>
          </el-row>
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
      getUserDataLoading: false,
      encryptedData: false,
      encryptedDataLoading: false,
      decryptedData: false,
      decryptedDataLoading: false,
      userEncryptedMobileData: '',
      pageTableData: [],
      tableData: [],
      backupRetrieved: 0,
      rules: {
        msg: [
          { required: true, message: 'Please input received message or coin', trigger: 'blur' },
          { min: 1, message: 'Length should be at least 1', trigger: 'blur' }
        ],
        sharedsecret: [
          { required: true, message: 'Please input shared secret', trigger: 'blur' },
          { min: 3, message: 'Length should be at least 3', trigger: 'blur' }
        ],
        recipeintAdd: [
          { required: true, message: 'Address must be in hex and legnth of 5', trigger: 'blur' },
          { min: 5, message: 'Must be in hex and length 5', trigger: 'blur' }
        ]
      },
      // Table labels begin.
      encryptedDataTableLabel: [
        { label: 'Encrypted data', prop: 'encryptedDataRetrieved', width: '680px' }
      ],
      decryptedDataTableLabel: [
        { label: 'Receiver', prop: 'receiver', width: '130px' },
        { label: 'Shared Secret', prop: 'sharedSecret', width: '160px' },
        { label: 'Counter', prop: 'counter', width: '90px' },
        { label: 'Data or Coin', prop: 'dataOrCoin', width: '200px' }
      ]
    }
  },
  components: {
    Head,
    Footer
  },
  created () {
    this.encryptedData = false
    this.decryptedData = false
  },
  methods: {
    submitForm (formName) {
      if (/^0x[0-9A-F]{5}$/i.test(this.receivedTnx.recipeintAdd) === true) {
        this.$refs[formName].validate(valid => {
          this.recipientProcessesLoading = true
          if (valid) {
            console.log('Form validations passed.')
            var tnxData = {
              msg: this.receivedTnx.msg,
              sharedSecret: this.receivedTnx.sharedsecret,
              recipeintAdd: this.receivedTnx.recipeintAdd
            }
            console.log('Received transaction data is: ', tnxData)
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
                      console.log('The BytesString data object: ', BytesString.data)
                      var byteData = BytesString.data
                      console.log('Original values as array: ', Object.values(BytesString.data))
                      const countEntries = Object.keys(byteData).length // Get current number of items.
                      console.log('Original number of entries: ', countEntries)
                      const increasedObjCount = Math.floor((countEntries / 4) + 1)
                      const newMsgIndex = 'msg'.concat(increasedObjCount)
                      const shSecret = 'sharedSecret'
                      const newshSecret = shSecret.concat(increasedObjCount)
                      const newcounterValue = 'counterValue'
                      const increasedCounterValue = newcounterValue.concat(increasedObjCount)
                      const newRecAdd = 'recAdd'
                      const newRecAddIndex = newRecAdd.concat(increasedObjCount)
                      // Get counter value and increment it.
                      var counters = Object.keys(byteData).filter(function (k) {
                        return k.indexOf('counterValue') === 0
                      }).reduce(function (pulledCounterData, k) {
                        pulledCounterData[k] = byteData[k]
                        return pulledCounterData
                      }, {})
                      const countersArray = Object.values(counters)
                      console.log('Counters object: ', countersArray)
                      const counterLength = countersArray.length
                      console.log('Next counter in use: ', counterLength)
                      // Update the object.
                      byteData[newMsgIndex] = tnxData.msg
                      byteData[newshSecret] = tnxData.sharedSecret
                      byteData[increasedCounterValue] = counterLength
                      byteData[newRecAddIndex] = tnxData.recipeintAdd
                      console.log('Object updated.')
                      console.log('New object is: ', byteData)
                      // Add to ipfs and publish to IPNS.
                      const msgJSONstr = { ...byteData }
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
                        }).catch(err => {
                          console.log('Error encrypting data', err)
                          this.recipientProcessesLoading = false
                          this.$message.error('Error encrypting data.')
                        })
                      })
                    } else {
                      console.log('Error!')
                      this.recipientProcessesLoading = false
                      this.$message.error('Sorry! No data found.')
                    }
                  }).catch((error) => {
                    this.recipientProcessesLoading = false
                    this.$message.error('Error decrypting data. Wrong decryption key.')
                    console.log('Error with decryption:', error)
                  }
                  )
                })
              })
            })
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
      console.log('Connecting to IPFS.')
      const MyBuffer = window.Ipfs.Buffer
      var dataToBuffer = MyBuffer.from(encryptedData)
      Myipfs.add(dataToBuffer).then(res => {
        console.log('Data upload to IPFS sucessful')
        this.loadingData = false
        console.log('IPFS hash is: ', res[0].hash)
        this.publishToIPNS(res[0].hash)
      })
    },
    publishToIPNS (returnedHash) {
      console.log('Connecting to IPNS')
      Myipfs.name.publish(returnedHash).then(res => {
        console.log('IPNS Success!')
        const ipnsHash = res.name
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
        // Reset form
        this.resetForm('receivedTnx')
      }).catch((err) => {
        console.log('IPNS error.', err)
      })
    },
    getUserData () {
      if (this.backupRetrieved === 0) {
        console.log('Retrieving user data')
        this.getUserDataLoading = true
        this.encryptedDataLoading = true
        Myipfs.name.resolve(this.$store.state.IPNShash).then(res => {
          console.log('IPNS Success!')
          console.log('IPFS equivalent hash is: ', res.path)
          // Get the data.
          Myipfs.cat(res.path).then(retrievedData => {
            this.$message('Backup data successfully retrieved.')
            this.tableData[0] = []
            this.tableData[0].encryptedDataRetrieved = retrievedData.toString('utf8')
            this.encryptedDataLoading = false
            this.encryptedData = true
            // Decrypting the data.
            this.decryptedDataLoading = true
            this.$prompt('Please your decryption key.', 'Information required', {
              confirmButtonText: 'Continue',
              cancelButtonText: 'Cancel',
              inputPlaceholder: 'Enter decryption key.'
            }).then(({ value }) => {
              symDecrypt(retrievedData.toString('utf8'), value).then(BytesString => {
                if (Object.keys(BytesString).length !== 0) {
                  console.log('Decryption successful')
                  console.log('The BytesString data object: ', BytesString.data)
                  const arrayBytesString = Object.values(BytesString)
                  console.log('BytesString as array is: ', arrayBytesString)
                  // Get all items. Object Structure: {msg:msg, sharedSecret:sharedSecret,counterValue:counterValue,recAdd:recAdd}
                  // Testing part retrieval: Receivers
                  var receivers = Object.keys(BytesString.data).filter(function (k) {
                    return k.indexOf('recAdd') === 0
                  }).reduce(function (pulledRecData, k) {
                    pulledRecData[k] = BytesString.data[k]
                    return pulledRecData
                  }, {})
                  const recArray = Object.values(receivers)
                  console.log('All receivers as values are: ', recArray)
                  // Show decrypted data.
                  if (Object.keys(BytesString.data).length >= 1) { // Checking for zero publications.
                    for (let i = 1; i < Object.keys(BytesString.data).length / 4; i++) {
                      this.pageTableData[i] = []
                      this.pageTableData[i].dataOrCoin = BytesString.data['msg'.concat(i + 1)]
                      this.pageTableData[i].sharedSecret = BytesString.data['sharedSecret'.concat(i + 1)]
                      this.pageTableData[i].counter = BytesString.data['counterValue'.concat(i + 1)]
                      this.pageTableData[i].receiver = BytesString.data['recAdd'.concat(i + 1)]
                      this.getUserDataLoading = false
                    }
                    this.$message({
                      message: 'Data decryption successful',
                      type: 'success',
                      center: true
                    })
                    this.decryptedDataLoading = false
                    this.decryptedData = true
                    // Set backup retrieved to 1.
                    this.backupRetrieved = 1
                  } else {
                    this.getUserDataLoading = false
                    this.decryptedDataLoading = false
                    this.$message({
                      message: 'No backup data found.',
                      type: 'warning',
                      center: true
                    })
                  }
                }
              }).catch(err => {
                console.log('Error decrypting data', err)
                this.getUserDataLoading = false
                this.$message.error('Error decrypting data. Wrong decryption key.')
              })
            })
          })
        })
      } else {
        this.$message.error('Already displaying retrieved data. Refresh page.')
      }
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
  width: 45rem;
  height: 32rem;
  margin-left: -8rem;
  border-width: 2px 2px;
  border-color: rgb(155, 97, 108);
  border-radius: 1%;
  background-color:rgb(221, 231, 243);
}

#btnGetData{
  margin-top: 1rem;
}

#decryptedTableDiv{
  margin-top: 1.5rem;
}
</style>
