import React from 'react';
import { ReactiveBase, SingleList, SelectedFilters, DateRange, MultiList } from '@appbaseio/reactivesearch';

import { GRQ_ES_URL, GRQ_ES_INDICES, GRQ_TABLE_VIEW_DEFAULT } from '../../config';

// import IDSearchBar from '../../components/IDSearchBar/index.jsx';
import ResultsList from '../../components/ResultsList/index.jsx';
import ReactiveMap from '../../components/ReactiveMap/index.jsx';

import './style.css';
import upArrow from '../../images/arrow-up.png';

// reactivesearch retrieves data from each component by its componentId
const ID_COMPONENT = 'ID';
const SEARCHBAR_COMPONENT_ID = 'query_string';
const DATASET_TYPE_SEARCH_ID = 'dataset_type';
const SATELLITE_TYPE_ID = 'satellite';
const MAP_COMPONENT_ID = 'polygon';
const RESULTS_LIST_COMPONENT_ID = 'results';
const DATASET_ID = 'dataset';
const TRACK_NUMBER_ID = 'track_number';
const TRACK_NUMBER_ID_OLD = 'trackNumber';
const START_TIME_ID = 'starttime';
const END_TIME_ID = 'endtime';
const USER_TAGS = 'user_tags';
const DATASET_VERSION = 'version';

const QUERY_LOGIC = { // query logic for elasticsearch
  'and': [
    SEARCHBAR_COMPONENT_ID,
    DATASET_TYPE_SEARCH_ID,
    SATELLITE_TYPE_ID,
    MAP_COMPONENT_ID,
    DATASET_ID,
    START_TIME_ID,
    END_TIME_ID,
    USER_TAGS,
    DATASET_VERSION,
  ],
  'or': [
    TRACK_NUMBER_ID,
    TRACK_NUMBER_ID_OLD,
  ]
};


export default class Tosca extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      esQuery: null,
      facetData: [],
      tableView: GRQ_TABLE_VIEW_DEFAULT, // boolean
      selectedId: null,
    };
    this._handleTransformRequest = this._handleTransformRequest.bind(this);
    this.retrieveData = this.retrieveData.bind(this);
  }

  _handleTransformRequest(e) { // handles the request to ES (also where to get es query)
    const query = e.body.split('\n')[1];
    this.setState({
      query: query ? btoa(query) : '' // saving base64 encoded query in state so we can use it 'on demand'
    });
    return e;
  }

  retrieveData({ data, rawData, aggregations }) {
    this.setState({
      facetData: data
    });
  }

  clickIdHandler(_id) {
    console.log('hahaha clicked me', _id);
    this.setState({
      selectedId: _id,
    });
  }

  render() {
    const { facetData, tableView, selectedId } = this.state;

    // https://discuss.elastic.co/t/view-surrounding-documents-causes-failed-to-parse-date-field-exception/147234 dateoptionalmapping
    return (
      <div className='main-container' >
        <button>
          <img type="image" src={upArrow} className="scroll-top-button" onClick={() => window.scrollTo(0, 0)} />
        </button>
        <ReactiveBase
          app={GRQ_ES_INDICES}
          url={GRQ_ES_URL}
          transformRequest={this._handleTransformRequest}
        >
          <div className='sidenav'>
            <div className='facet-container'>
              {/* <DataSearch
                componentId={SEARCHBAR_COMPONENT_ID}
                dataField={['id']}
                placeholder='Dataset Type'
                URLParams={true}
              /> */}
              {/* <br /> */}
              <SingleList
                componentId={DATASET_ID}
                dataField='dataset.raw'
                title='Dataset'
                URLParams={true}
                style={{ fontSize: 12 }}
                className="reactivesearch-input"
              />
              <SingleList
                componentId={DATASET_TYPE_SEARCH_ID}
                dataField='dataset_type.raw'
                title='Dataset Type'
                URLParams={true}
                style={{ fontSize: 12 }}
                className="reactivesearch-input"
              />

              <SingleList
                componentId={SATELLITE_TYPE_ID}
                dataField='metadata.platform.raw'
                title='Platforms'
                URLParams={true}
                style={{ fontSize: 12 }}
                className="reactivesearch-input"
              />

              <SingleList
                componentId={DATASET_VERSION}
                dataField='version.raw'
                title='Version'
                URLParams={true}
                style={{ fontSize: 12 }}
                className="reactivesearch-input"
              />

              <SingleList
                componentId={USER_TAGS}
                dataField='metadata.user_tags.raw'
                title='User Tags'
                URLParams={true}
                style={{ fontSize: 12 }}
                className="reactivesearch-input"
              />

              <DateRange
                componentId={START_TIME_ID}
                title="Start Time"
                dataField="starttime"
                style={{ fontSize: 12 }}
              />
              <br />
              <DateRange
                componentId={END_TIME_ID}
                title="End Time"
                dataField="endtime"
                style={{ fontSize: 12 }}
              />

              <br />
              <MultiList
                componentId={TRACK_NUMBER_ID}
                dataField='metadata.track_number'
                title='Track Number'
                URLParams={true}
                style={{ fontSize: 12 }}
                className="reactivesearch-input"
              />
              <MultiList
                componentId={TRACK_NUMBER_ID_OLD}
                dataField='metadata.trackNumber'
                title='Track Number (Old)'
                URLParams={true}
                style={{ fontSize: 12 }}
                className="reactivesearch-input"
              />
            </div>
          </div>

          <div className='body'>
            <SelectedFilters className='filterList' />

            <div className='utility-button-container'>
              <a
                className='utility-button'
                href={`/tosca/on-demand?query=${this.state.query}`}
                target='_blank'
              >
                On Demand
            </a>
              <a className='utility-button' href='#'>
                Trigger Rules (Work in Progress)
            </a>
            </div>

            <ReactiveMap
              componentId={MAP_COMPONENT_ID}
              zoom={5}
              maxZoom={8}
              minZoom={2}
              data={facetData}
            />
            <br />
            <ResultsList
              componentId={RESULTS_LIST_COMPONENT_ID}
              queryParams={QUERY_LOGIC}
              retrieveData={this.retrieveData}
              pageSize={10}
            />
            <br />
          </div>
        </ReactiveBase>
      </div>
    );
  }
}
