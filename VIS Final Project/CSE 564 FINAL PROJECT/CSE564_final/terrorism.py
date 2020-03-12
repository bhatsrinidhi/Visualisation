import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')
from flask import Flask, request, render_template
import json
import nltk

from nltk import word_tokenize,sent_tokenize
from scipy.misc import imread
from wordcloud import WordCloud, STOPWORDS
from sklearn.model_selection import train_test_split
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
# Read the file
df = pd.read_csv("data/globalterrorismdb_0718dist.csv", low_memory=False, encoding='ISO-8859-1')
df = df.dropna(thresh=160000,axis=1)
df = df.sample(500, replace="False")
df.reset_index(inplace=True)
df = df[(df.crit1 == 1) & (df.crit2 == 1) & (df.crit3 == 1) & (df.doubtterr == 0)]
# Weapontype column contains very long name for vehicle property -> shorten.
df.weaptype1_txt.replace(
    'Vehicle (not to include vehicle-borne explosives, i.e., car or truck bombs)',
    'Vehicle', inplace = True)

# Ensure consistent values and make everything lowercase.
df.target1 = df.target1.str.lower()
df.gname = df.gname.str.lower()
df.target1 = df.target1.fillna('unknown').replace('unk','unknown')
df.nkill = np.round(df.nkill.fillna(df.nkill.median())).astype(int)
df.nwound = np.round(df.nwound.fillna(df.nwound.median())).astype(int)
data = df

data.rename(columns={'iyear':'Year','imonth':'Month','iday':'Day','country_txt':'Country','region_txt':'Region','attacktype1_txt':'AttackType','target1':'Target','nkill':'Killed','nwound':'Wounded','gname':'Group','targtype1_txt':'Target_type','weaptype1_txt':'Weapon_type'},inplace=True)
data=data[['Year','Month','Day','Country','Region','city','latitude','longitude','AttackType','Killed','Wounded','Target','Group','Target_type','Weapon_type','extended', 'vicinity', 'doubtterr', 'multiple', 'success', 'suicide', 'property', 'ishostkid', 'region', 'attacktype1', 'targtype1']]
data['casualities']=data['Killed']+data['Wounded']
data['has_casualties'] = data['casualities'].apply(lambda x: 0 if x == 0 else 1)
map_data = data
map_data["country_name"] = data["Country"]
map_data["Attack_Type"] = data["AttackType"]
map_data["Targettype"] = data["Target_type"]
map_data["Weapontype"] = data["Weapon_type"]
data_predict = data

motive=data['Group'].str.lower().str.cat(sep=' ')
words=nltk.tokenize.word_tokenize(motive)
word_dist = nltk.FreqDist(words)
stopwords = nltk.corpus.stopwords.words('english')
img1 = imread("data/kaggle.png")
hcmask1 = img1
words_except_stop_dist = nltk.FreqDist(w for w in words if w not in stopwords)
wordcloud = WordCloud(stopwords=STOPWORDS,background_color='black',mask=hcmask1).generate(" ".join(words_except_stop_dist))
plt.imshow(wordcloud)
fig=plt.gcf()
fig.set_size_inches(10,6)
plt.axis('off')
plt.title('Terrorist Groups')
plt.savefig('static/Terrorist_Groups.png', transparent=True)

df_hfi = pd.read_csv('data/hfi_cc_2018.csv')
region_list = df_hfi.region.unique().tolist()
req_data = pd.DataFrame(columns=region_list)
for i in region_list:
    selected_group = df_hfi.loc[df_hfi['region'] == i]['hf_score'].values.tolist()
    req_data[i] = pd.Series(selected_group)
    req_data[i] = req_data[i].fillna(0)
req_data = req_data.apply(lambda x: x.sort_values().values)

with open('data/world_countries.json', 'r') as myfile:
    mydata=myfile.read()
data_world = json.loads(mydata)

attack_data = pd.DataFrame(data)
attack_data = attack_data.sort_values(by=['Year'])
test_data = pd.read_csv("data/valuesForDD.csv", low_memory=False, encoding='ISO-8859-1')



@app.route('/')
def index():
    return render_template('terrorism.html')

@app.route('/getdata', methods=['GET','POST'])
def getdata():
    # Read the file
    # PCA Scree Plot and Scatter Plot
    if(request.form['dataplot'] == "Targettype"):
       return json.dumps({'data_columns': data.to_json(orient='records')})
    elif(request.form['dataplot'] == "AttackType"):
       data1 = map_data.groupby(['Region', 'Attack_Type'])['Attack_Type'].count().reset_index(name="Count").reindex(columns=['Region', 'Attack_Type', 'Count'])
       return json.dumps({'data_columns': data1.to_json(orient='records')})
    elif(request.form['dataplot'] == "Country"):
       coun_terror=map_data['country_name'].value_counts()[:50].rename_axis('country_name').reset_index(name='Attacks')
       coun_kill=map_data.groupby('country_name')['Killed'].sum()[:50].rename_axis('country_name').reset_index(name='Killed')
       data2 =  pd.merge(coun_terror, coun_kill, on='country_name')
       return json.dumps({'data_columns': data2.to_json(orient='records')})
    elif(request.form['dataplot'] == "Trend"):
       data2 = data.groupby(['Region', 'Year'])['Year'].count().reset_index(name="Count").reindex(columns=['Region', 'Year', 'Count'])
       data2 = data2.sort_values(by=['Year'])
       return json.dumps({'data_columns': data2.to_json(orient='records')})
    elif(request.form['dataplot'] == "hfi"):
       min_all = np.nanmin(req_data.replace(0, np.nan).values)
       max_all = np.nanmax(req_data.replace(0, np.nan).values)
       min_max = [min_all, max_all]
       return json.dumps({'data_columns': req_data.to_json(), 'min_max': min_max})
    elif(request.form['dataplot'] == "countAttacks"):
       country_count = map_data.groupby(['country_name']).size().to_frame(name = 'count').reset_index()
       country_count = country_count.rename(columns={'country_name': 'name'})
       country_count.replace({'name': { 'United States' : 'USA', 'Bahamas' : 'The Bahamas', 'United Kingdom' : 'England', 'Guinea-Bissau' : 'Guinea Bissau', 'Serbia' : 'Republic of Serbia', 'Tanzania': 'United Republic of Tanzania'}},inplace=True)
       return json.dumps({'data_world':data_world, 'data_columns': country_count.to_json(orient='records')})
    elif(request.form['dataplot'] == "prediction"):
       feature_cols = [
        'Year', 'Month', 'Day', 'latitude', 'longitude',
        'extended',
        'vicinity',
        'doubtterr',
        'multiple',
        'success',
        'suicide',
        'property',
        'ishostkid',
        'Country',
        'region',
        'AttackType',
        'Target_type',
        'Weapon_type',
        ]
       target_col = 'has_casualties'
       lb = LabelEncoder()
       data_predict['Country'] = lb.fit_transform(data_predict['Country'])
       data_predict['AttackType'] = lb.fit_transform(data_predict['AttackType'])
       data_predict['Target_type'] = lb.fit_transform(data_predict['Target_type'])
       data_predict['Weapon_type'] = lb.fit_transform(data_predict['Weapon_type'])
       X = data_predict[feature_cols].fillna(0)
       y = data_predict[target_col]
       X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)
       forest = ExtraTreesClassifier(n_estimators=20,
                                      random_state=0)
       forest.fit(X, y)
       importances = forest.feature_importances_
       std = np.std([tree.feature_importances_ for tree in forest.estimators_],
                     axis=0)
       indices = np.argsort(importances)[::-1]
       fnames = [feature_cols[i] for i in indices]
       predictionList = list(zip(fnames, importances[indices]))
       return json.dumps({'data_columns':data_predict.to_json(orient='records'), 'predictionList':predictionList})
    elif(request.form['dataplot'] == "dashboard"):
       return json.dumps({'data_columns':attack_data.to_json(orient='records'), 'test_data':test_data.to_json(orient='records')})
    return "false"
if __name__ == '__main__':
    app.run(debug=True)
