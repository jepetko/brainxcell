describe('brainxcell', function() {

    var b = brainxcell;
    function createTgt() {
        $('body').append('<div id="tgt"></div>');
        return $('#tgt');
    }
    var tgt = createTgt();

    beforeEach( function() {

    });

    it('should initialize root', function() {
        root( { id : 'root', desc : 'Javascript' } );
        expect( b.root ).not.toBeNull();
        expect( b.root.children.length).toBe(0);

        expect( b.root.id).toBe('root');
        expect( b.root.desc).toBe('Javascript');

    });

    it('should add branches', function() {
        root().branch({ id : 'functions', desc : 'Functions' });

        expect( b.root.children ).not.toBeNull();
        expect( b.root.children.length ).toBe(1);

        root().branch({ id : 'variables', desc : 'Variables'});

        expect( b.root.children.length).toBe(2);

        //check for id, desc
        var firstBranch = b.root.children[0];
        var secBranch = b.root.children[1];
        expect( firstBranch.id).toBe('functions');
        expect( secBranch.id).toBe('variables');

        firstBranch.branch({id : 'calling', desc : 'Howto call them' } );

        expect( firstBranch.children.length).toBe(1);
        var firstBranch_0 = firstBranch.children[0];
        expect(firstBranch_0.id).toBe('calling');
        expect(firstBranch_0.desc).toBe('Howto call them');
    });

    it('should have depth = 5', function() {
        root().branch({id : 'A'}).branch({id : 'B'}).branch({id : 'C'}).branch({id : 'D'});
        expect( root().getDepth()).toBe(5);
    });

    describe("brainxcell rendering", function() {
        it("should render the root in the middle of the tgt", function() {
            //root().play(tgt);
            //todo: check whether it's in the middle
        })
    });

});